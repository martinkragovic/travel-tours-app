import {
  Body,
  Controller,
  Delete,
  Param,
  ParseIntPipe,
  Post,
  Put,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UpdateTourImageDto } from './dto/update-tour-image.dto';
import { UploadTourImagesDto } from './dto/upload-tour-images.dto';
import { TourImagesService } from './tour-images.service';

const uploadDir = join(process.cwd(), 'uploads', 'tour-images');

mkdirSync(uploadDir, {
  recursive: true,
});

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller()
export class TourImagesController {
  constructor(private readonly tourImagesService: TourImagesService) {}

  @Post('admin/tours/:tourId/images')
  @UseInterceptors(
    FilesInterceptor('images', 10, {
      storage: diskStorage({
        destination: uploadDir,
        filename: (_req, file, callback) => {
          const uniqueSuffix = `${Date.now()}-${Math.round(
            Math.random() * 1_000_000_000,
          )}`;
          const extension = extname(file.originalname).toLowerCase();

          callback(null, `${uniqueSuffix}${extension}`);
        },
      }),
      fileFilter: (_req, file, callback) => {
        const allowedMimeTypes = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'image/jpg',
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new Error('Можно загружать только изображения JPG, PNG или WEBP'),
            false,
          );
        }

        callback(null, true);
      },
      limits: {
        fileSize: 5 * 1024 * 1024,
      },
    }),
  )
  uploadImages(
    @Param('tourId', ParseIntPipe) tourId: number,
    @UploadedFiles() files: Express.Multer.File[],
    @Body() dto: UploadTourImagesDto,
  ) {
    return this.tourImagesService.uploadImages(tourId, files, dto);
  }

  @Put('admin/tour-images/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTourImageDto,
  ) {
    return this.tourImagesService.update(id, dto);
  }

  @Delete('admin/tour-images/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.tourImagesService.remove(id);
  }
}
