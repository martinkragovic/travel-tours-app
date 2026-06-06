import { DifficultyLevel } from '@prisma/client';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateAdminTourDto {
  @IsOptional()
  @IsString({ message: 'Название тура должно быть строкой' })
  @MaxLength(200, {
    message: 'Название тура не должно быть длиннее 200 символов',
  })
  title?: string;

  @IsOptional()
  @IsString({ message: 'Slug должен быть строкой' })
  @MaxLength(200, { message: 'Slug не должен быть длиннее 200 символов' })
  slug?: string;

  @IsOptional()
  @IsString({ message: 'Краткое описание должно быть строкой' })
  @MaxLength(500, {
    message: 'Краткое описание не должно быть длиннее 500 символов',
  })
  shortDescription?: string;

  @IsOptional()
  @IsString({ message: 'Полное описание должно быть строкой' })
  fullDescription?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'ID страны должен быть числом' })
  @Min(1, { message: 'ID страны должен быть больше 0' })
  countryId?: number;

  @IsOptional()
  @IsArray({ message: 'Категории должны быть массивом ID' })
  @Type(() => Number)
  categoryIds?: number[];

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Длительность должна быть числом' })
  @Min(1, { message: 'Длительность должна быть минимум 1 день' })
  durationDays?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Минимальная цена должна быть числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  minPrice?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Максимальное количество участников должно быть числом' })
  @Min(1, { message: 'Количество участников должно быть минимум 1' })
  maxParticipants?: number;

  @IsOptional()
  @IsEnum(DifficultyLevel, { message: 'Некорректный уровень сложности' })
  difficultyLevel?: DifficultyLevel;

  @IsOptional()
  @IsString({ message: 'Блок "Что вас ждёт" должен быть строкой' })
  whatIncluded?: string;

  @IsOptional()
  @IsString({ message: 'Требования должны быть строкой' })
  requirements?: string;

  @IsOptional()
  @IsString({ message: 'Условия отмены должны быть строкой' })
  cancellationPolicy?: string;

  @IsOptional()
  @IsBoolean({ message: 'Статус публикации должен быть boolean' })
  isPublished?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Порядок сортировки должен быть числом' })
  sortOrder?: number;
}
