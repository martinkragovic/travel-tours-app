import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateTourImageDto {
  @IsOptional()
  @IsString({ message: 'Alt-текст должен быть строкой' })
  @MaxLength(200, {
    message: 'Alt-текст не должен быть длиннее 200 символов',
  })
  altText?: string;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean({ message: 'Поле isMain должно быть boolean' })
  isMain?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Порядок сортировки должен быть числом' })
  sortOrder?: number;
}
