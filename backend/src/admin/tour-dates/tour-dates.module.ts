import { Module } from '@nestjs/common';
import { TourDatesController } from './tour-dates.controller';
import { TourDatesService } from './tour-dates.service';

@Module({
  controllers: [TourDatesController],
  providers: [TourDatesService],
})
export class TourDatesModule {}
