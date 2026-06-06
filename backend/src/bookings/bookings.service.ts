import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BookingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto } from './dto/create-booking.dto';

@Injectable()
export class BookingsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBookingDto) {
    if (!dto.customerPhone && !dto.customerEmail) {
      throw new BadRequestException('Укажите телефон или email');
    }

    return this.prisma.$transaction(async (tx) => {
      const tour = await tx.tour.findFirst({
        where: {
          id: dto.tourId,
          isPublished: true,
        },
        select: {
          id: true,
          title: true,
          minPrice: true,
          maxParticipants: true,
        },
      });

      if (!tour) {
        throw new NotFoundException('Тур не найден');
      }

      if (dto.participants > tour.maxParticipants) {
        throw new BadRequestException(
          `Для этого тура нельзя выбрать больше ${tour.maxParticipants} участников`,
        );
      }

      const tourDate = await tx.tourDate.findFirst({
        where: {
          id: dto.tourDateId,
          tourId: dto.tourId,
        },
        select: {
          id: true,
          tourId: true,
          startDate: true,
          endDate: true,
          price: true,
          availableSeats: true,
          isAvailable: true,
        },
      });

      if (!tourDate) {
        throw new NotFoundException('Дата тура не найдена');
      }

      if (!tourDate.isAvailable) {
        throw new BadRequestException(
          'Эта дата тура недоступна для бронирования',
        );
      }

      if (tourDate.availableSeats < dto.participants) {
        throw new BadRequestException(
          `Недостаточно свободных мест. Осталось мест: ${tourDate.availableSeats}`,
        );
      }

      const pricePerPerson = tourDate.price ?? tour.minPrice;
      const totalPrice = pricePerPerson * dto.participants;

      const booking = await tx.booking.create({
        data: {
          tourId: dto.tourId,
          tourDateId: dto.tourDateId,
          customerName: dto.customerName,
          customerPhone: dto.customerPhone,
          customerEmail: dto.customerEmail,
          participants: dto.participants,
          totalPrice,
          customerComment: dto.customerComment,
          status: BookingStatus.NEW,
        },
        select: {
          id: true,
          customerName: true,
          customerPhone: true,
          customerEmail: true,
          participants: true,
          totalPrice: true,
          customerComment: true,
          status: true,
          createdAt: true,
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

      await tx.tourDate.update({
        where: {
          id: dto.tourDateId,
        },
        data: {
          availableSeats: {
            decrement: dto.participants,
          },
        },
      });

      return {
        message: 'Заявка успешно создана',
        booking,
      };
    });
  }
}
