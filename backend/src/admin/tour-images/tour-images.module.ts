import { Module } from '@nestjs/common';
import { TourImagesController } from './tour-images.controller';
import { TourImagesService } from './tour-images.service';

@Module({
  controllers: [TourImagesController],
  providers: [TourImagesService],
})
export class TourImagesModule {}
