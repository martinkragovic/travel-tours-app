import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTourDateDto } from './dto/create-tour-date.dto';
import { UpdateTourDateDto } from './dto/update-tour-date.dto';

@Injectable()
export class TourDatesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(tourId: number, dto: CreateTourDateDto) {
    await this.ensureTourExists(tourId);

    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    this.validateDates(startDate, endDate);

    const availableSeats = dto.availableSeats ?? dto.totalSeats;

    if (availableSeats > dto.totalSeats) {
      throw new BadRequestException(
        'Количество свободных мест не может быть больше общего количества мест',
      );
    }

    const tourDate = await this.prisma.tourDate.create({
      data: {
        tourId,
        startDate,
        endDate,
        price: dto.price,
        totalSeats: dto.totalSeats,
        availableSeats,
        isAvailable: dto.isAvailable ?? true,
      },
      select: this.getTourDateSelect(),
    });

    return {
      message: 'Дата тура добавлена',
      tourDate,
    };
  }

  async update(id: number, dto: UpdateTourDateDto) {
    const existingDate = await this.prisma.tourDate.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        startDate: true,
        endDate: true,
        totalSeats: true,
        availableSeats: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!existingDate) {
      throw new NotFoundException('Дата тура не найдена');
    }

    const nextStartDate = dto.startDate
      ? new Date(dto.startDate)
      : existingDate.startDate;

    const nextEndDate = dto.endDate
      ? new Date(dto.endDate)
      : existingDate.endDate;

    this.validateDates(nextStartDate, nextEndDate);

    const nextTotalSeats = dto.totalSeats ?? existingDate.totalSeats;
    const nextAvailableSeats =
      dto.availableSeats ?? existingDate.availableSeats;

    if (nextAvailableSeats > nextTotalSeats) {
      throw new BadRequestException(
        'Количество свободных мест не может быть больше общего количества мест',
      );
    }

    const bookedSeats = existingDate.totalSeats - existingDate.availableSeats;

    if (nextTotalSeats < bookedSeats) {
      throw new BadRequestException(
        `Нельзя установить общее количество мест меньше уже забронированного количества. Уже забронировано мест: ${bookedSeats}`,
      );
    }

    const tourDate = await this.prisma.tourDate.update({
      where: {
        id,
      },
      data: {
        startDate: dto.startDate ? nextStartDate : undefined,
        endDate: dto.endDate ? nextEndDate : undefined,
        price: dto.price,
        totalSeats: dto.totalSeats,
        availableSeats: dto.availableSeats,
        isAvailable: dto.isAvailable,
      },
      select: this.getTourDateSelect(),
    });

    return {
      message: 'Дата тура обновлена',
      tourDate,
    };
  }

  async remove(id: number) {
    const tourDate = await this.prisma.tourDate.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!tourDate) {
      throw new NotFoundException('Дата тура не найдена');
    }

    if (tourDate._count.bookings > 0) {
      throw new BadRequestException(
        'Нельзя удалить дату тура, по которой уже есть заявки. Можно закрыть дату для бронирования.',
      );
    }

    await this.prisma.tourDate.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Дата тура удалена',
      id,
    };
  }

  private async ensureTourExists(tourId: number) {
    const tour = await this.prisma.tour.findUnique({
      where: {
        id: tourId,
      },
      select: {
        id: true,
      },
    });

    if (!tour) {
      throw new NotFoundException('Тур не найден');
    }
  }

  private validateDates(startDate: Date, endDate: Date) {
    if (Number.isNaN(startDate.getTime())) {
      throw new BadRequestException('Некорректная дата начала');
    }

    if (Number.isNaN(endDate.getTime())) {
      throw new BadRequestException('Некорректная дата окончания');
    }

    if (endDate < startDate) {
      throw new BadRequestException(
        'Дата окончания не может быть раньше даты начала',
      );
    }
  }

  private getTourDateSelect() {
    return {
      id: true,
      tourId: true,
      startDate: true,
      endDate: true,
      price: true,
      totalSeats: true,
      availableSeats: true,
      isAvailable: true,
      createdAt: true,
      updatedAt: true,
      tour: {
        select: {
          id: true,
          title: true,
          slug: true,
        },
      },
    };
  }
}
