import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateCategoryDto {
  @IsOptional()
  @IsString({ message: 'Название категории должно быть строкой' })
  @MaxLength(100, {
    message: 'Название категории не должно быть длиннее 100 символов',
  })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Slug должен быть строкой' })
  @MaxLength(100, {
    message: 'Slug не должен быть длиннее 100 символов',
  })
  slug?: string;

  @IsOptional()
  @IsString({ message: 'Описание должно быть строкой' })
  @MaxLength(500, {
    message: 'Описание не должно быть длиннее 500 символов',
  })
  description?: string;

  @IsOptional()
  @IsBoolean({ message: 'Статус активности должен быть boolean' })
  isActive?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Порядок сортировки должен быть числом' })
  sortOrder?: number;
}
