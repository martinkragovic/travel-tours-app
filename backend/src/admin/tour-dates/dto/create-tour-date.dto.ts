import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateTourDateDto {
  @IsDateString({}, { message: 'Дата начала должна быть корректной датой' })
  startDate!: string;

  @IsDateString({}, { message: 'Дата окончания должна быть корректной датой' })
  endDate!: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Цена должна быть числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  price?: number;

  @Type(() => Number)
  @IsInt({ message: 'Общее количество мест должно быть числом' })
  @Min(1, { message: 'Общее количество мест должно быть минимум 1' })
  totalSeats!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Количество свободных мест должно быть числом' })
  @Min(0, { message: 'Количество свободных мест не может быть отрицательным' })
  availableSeats?: number;

  @IsOptional()
  @IsBoolean({ message: 'Статус доступности должен быть boolean' })
  isAvailable?: boolean;
}
