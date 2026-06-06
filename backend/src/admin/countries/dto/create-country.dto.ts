import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCountryDto {
  @IsString({ message: 'Название страны должно быть строкой' })
  @MaxLength(100, {
    message: 'Название страны не должно быть длиннее 100 символов',
  })
  name!: string;

  @IsString({ message: 'Slug должен быть строкой' })
  @MaxLength(100, {
    message: 'Slug не должен быть длиннее 100 символов',
  })
  slug!: string;

  @IsOptional()
  @IsBoolean({ message: 'Статус активности должен быть boolean' })
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Порядок сортировки должен быть числом' })
  sortOrder?: number;
}
