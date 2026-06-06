import { IsIn, IsOptional, IsString } from 'class-validator';

export class GetToursQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  countrySlug?: string;

  @IsOptional()
  @IsString()
  categorySlug?: string;

  @IsOptional()
  @IsIn(['under_10000', '10000_20000', '20000_50000', '50000_plus'])
  priceRange?: string;

  @IsOptional()
  @IsIn(['1_3', '3_5', '5_10'])
  durationRange?: string;

  @IsOptional()
  @IsIn(['1_2', '3_5', '5_10', '10_plus'])
  peopleRange?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;
}
