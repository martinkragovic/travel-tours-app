import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateAdminTourDto } from './dto/create-admin-tour.dto';
import { GetAdminToursQueryDto } from './dto/get-admin-tours-query.dto';
import { UpdateAdminTourDto } from './dto/update-admin-tour.dto';
import { ToursService } from './tours.service';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/tours')
export class ToursController {
  constructor(private readonly toursService: ToursService) {}

  @Get()
  findAll(@Query() query: GetAdminToursQueryDto) {
    return this.toursService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.toursService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateAdminTourDto) {
    return this.toursService.create(dto);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminTourDto,
  ) {
    return this.toursService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.toursService.remove(id);
  }
}
