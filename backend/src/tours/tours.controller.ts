import { Controller, Get, Param, Query } from '@nestjs/common';
import { GetToursQueryDto } from './dto/get-tours-query.dto';
import { ToursService } from './tours.service';

@Controller('tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Get()
  findAll(@Query() query: GetToursQueryDto) {
    return this.toursService.findAll(query);
  }

  @Get(':slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.toursService.findOneBySlug(slug);
  }
}
