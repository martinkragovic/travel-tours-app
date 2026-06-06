import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateTourDateDto } from './dto/create-tour-date.dto';
import { UpdateTourDateDto } from './dto/update-tour-date.dto';
import { TourDatesService } from './tour-dates.service';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller()
export class TourDatesController {
  constructor(private readonly tourDatesService: TourDatesService) {}

  @Post('admin/tours/:tourId/dates')
  create(
    @Param('tourId', ParseIntPipe) tourId: number,
    @Body() dto: CreateTourDateDto,
  ) {
    return this.tourDatesService.create(tourId, dto);
  }

  @Put('admin/tour-dates/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTourDateDto,
  ) {
    return this.tourDatesService.update(id, dto);
  }

  @Delete('admin/tour-dates/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tourDatesService.remove(id);
  }
}
