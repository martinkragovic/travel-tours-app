import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { GetAdminBookingsQueryDto } from './dto/get-admin-bookings-query.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetAdminBookingsQueryDto) {
    const page = this.parsePositiveNumber(query.page, 1);
    const limit = this.parsePositiveNumber(query.limit, 10);
    const safeLimit = Math.min(limit, 50);
    const skip = (page - 1) * safeLimit;

    const where = this.buildWhere(query);

    const [items, total] = await Promise.all([
      this.prisma.booking.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          customerName: true,
          customerPhone: true,
          customerEmail: true,
          participants: true,
          totalPrice: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          tour: {
            select: {
              id: true,
              title: true,
              slug: true,
            },
          },
          tourDate: {
            select: {
              id: true,
              startDate: true,
              endDate: true,
              price: true,
            },
          },
        },
      }),

      this.prisma.booking.count({
        where,
      }),
    ]);

    return {
      items,
      meta: {
        page,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async findOne(id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        customerName: true,
        customerPhone: true,
        customerEmail: true,
        participants: true,
        totalPrice: true,
        customerComment: true,
        adminComment: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        tour: {
          select: {
            id: true,
            title: true,
            slug: true,
            minPrice: true,
            durationDays: true,
            country: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        tourDate: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            price: true,
            totalSeats: true,
            availableSeats: true,
            isAvailable: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Заявка не найдена');
    }

    return booking;
  }

  async updateStatus(id: number, dto: UpdateBookingStatusDto) {
    const booking = await this.prisma.booking.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Заявка не найдена');
    }

    return this.prisma.booking.update({
      where: {
        id,
      },
      data: {
        status: dto.status,
        adminComment: dto.adminComment,
      },
      select: {
        id: true,
        customerName: true,
        customerPhone: true,
        customerEmail: true,
        participants: true,
        totalPrice: true,
        customerComment: true,
        adminComment: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        tour: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        tourDate: {
          select: {
            id: true,
            startDate: true,
            endDate: true,
            price: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    const booking = await this.prisma.booking.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!booking) {
      throw new NotFoundException('Заявка не найдена');
    }

    await this.prisma.booking.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Заявка удалена',
      id,
    };
  }

  private buildWhere(
    query: GetAdminBookingsQueryDto,
  ): Prisma.BookingWhereInput {
    const where: Prisma.BookingWhereInput = {};

    if (query.status) {
      where.status = query.status;
    }

    if (query.search) {
      where.OR = [
        {
          customerName: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          customerPhone: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          customerEmail: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          tour: {
            title: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    return where;
  }

  private parsePositiveNumber(value: string | undefined, defaultValue: number) {
    if (!value) {
      return defaultValue;
    }

    const parsed = Number(value);

    if (Number.isNaN(parsed) || parsed <= 0) {
      return defaultValue;
    }

    return parsed;
  }
}
