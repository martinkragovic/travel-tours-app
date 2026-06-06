import { BookingStatus } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus, { message: 'Некорректный статус заявки' })
  status!: BookingStatus;

  @IsOptional()
  @IsString({ message: 'Комментарий администратора должен быть строкой' })
  @MaxLength(1000, {
    message: 'Комментарий администратора не должен быть длиннее 1000 символов',
  })
  adminComment?: string;
}
