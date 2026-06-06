import {
  IsEmail,
  IsInt,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateBookingDto {
  @Type(() => Number)
  @IsInt({ message: 'ID тура должен быть числом' })
  @Min(1, { message: 'ID тура должен быть больше 0' })
  tourId: number;

  @Type(() => Number)
  @IsInt({ message: 'ID даты тура должен быть числом' })
  @Min(1, { message: 'ID даты тура должен быть больше 0' })
  tourDateId: number;

  @IsString({ message: 'Имя клиента должно быть строкой' })
  @MaxLength(100, {
    message: 'Имя клиента не должно быть длиннее 100 символов',
  })
  customerName: string;

  @IsOptional()
  @IsString({ message: 'Телефон должен быть строкой' })
  @MaxLength(30, { message: 'Телефон не должен быть длиннее 30 символов' })
  customerPhone?: string;

  @IsOptional()
  @IsEmail({}, { message: 'Email должен быть корректным' })
  @MaxLength(150, { message: 'Email не должен быть длиннее 150 символов' })
  customerEmail?: string;

  @Type(() => Number)
  @IsInt({ message: 'Количество участников должно быть числом' })
  @Min(1, { message: 'Количество участников должно быть минимум 1' })
  participants: number;

  @IsOptional()
  @IsString({ message: 'Комментарий должен быть строкой' })
  @MaxLength(1000, {
    message: 'Комментарий не должен быть длиннее 1000 символов',
  })
  customerComment?: string;
}
