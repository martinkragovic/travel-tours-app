import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { existsSync } from 'fs';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateTourImageDto } from './dto/update-tour-image.dto';
import { UploadTourImagesDto } from './dto/upload-tour-images.dto';

type UploadedFile = Express.Multer.File;

type TourImageResponse = {
  id: number;
  tourId: number;
  filePath: string;
  altText: string | null;
  isMain: boolean;
  sortOrder: number;
  uploadedAt: Date;
};

@Injectable()
export class TourImagesService {
  constructor(private readonly prisma: PrismaService) {}

  async uploadImages(
    tourId: number,
    files: UploadedFile[],
    dto: UploadTourImagesDto,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException(
        'Необходимо загрузить хотя бы одно изображение',
      );
    }

    const tour = await this.prisma.tour.findUnique({
      where: {
        id: tourId,
      },
      select: {
        id: true,
      },
    });

    if (!tour) {
      await this.deleteUploadedFiles(files);
      throw new NotFoundException('Тур не найден');
    }

    const shouldSetMain = dto.isMain === true;

    const createdImages = await this.prisma.$transaction(async (tx) => {
      if (shouldSetMain) {
        await tx.tourImage.updateMany({
          where: {
            tourId,
          },
          data: {
            isMain: false,
          },
        });
      }

      const images: TourImageResponse[] = [];

      for (let index = 0; index < files.length; index++) {
        const file = files[index];

        const image = await tx.tourImage.create({
          data: {
            tourId,
            filePath: `/uploads/tour-images/${file.filename}`,
            altText: dto.altText,
            isMain: shouldSetMain && index === 0,
            sortOrder:
              dto.sortOrder !== undefined ? dto.sortOrder + index : index,
          },
          select: this.getImageSelect(),
        });

        images.push(image);
      }

      return images;
    });

    return {
      message: 'Изображения загружены',
      images: createdImages,
    };
  }

  async update(id: number, dto: UpdateTourImageDto) {
    const image = await this.prisma.tourImage.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        tourId: true,
      },
    });

    if (!image) {
      throw new NotFoundException('Изображение не найдено');
    }

    const updatedImage = await this.prisma.$transaction(async (tx) => {
      if (dto.isMain === true) {
        await tx.tourImage.updateMany({
          where: {
            tourId: image.tourId,
          },
          data: {
            isMain: false,
          },
        });
      }

      return tx.tourImage.update({
        where: {
          id,
        },
        data: {
          altText: dto.altText,
          isMain: dto.isMain,
          sortOrder: dto.sortOrder,
        },
        select: this.getImageSelect(),
      });
    });

    return {
      message: 'Изображение обновлено',
      image: updatedImage,
    };
  }

  async remove(id: number) {
    const image = await this.prisma.tourImage.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        filePath: true,
      },
    });

    if (!image) {
      throw new NotFoundException('Изображение не найдено');
    }

    await this.prisma.tourImage.delete({
      where: {
        id,
      },
    });

    await this.deleteFileByPublicPath(image.filePath);

    return {
      message: 'Изображение удалено',
      id,
    };
  }

  private getImageSelect() {
    return {
      id: true,
      tourId: true,
      filePath: true,
      altText: true,
      isMain: true,
      sortOrder: true,
      uploadedAt: true,
    };
  }

  private async deleteUploadedFiles(files: UploadedFile[]) {
    await Promise.all(
      files.map((file) => {
        return this.safeDeleteFile(file.path);
      }),
    );
  }

  private async deleteFileByPublicPath(filePath: string) {
    const normalizedPath = filePath.replace(/^\/uploads\//, '');
    const absolutePath = join(process.cwd(), 'uploads', normalizedPath);

    await this.safeDeleteFile(absolutePath);
  }

  private async safeDeleteFile(absolutePath: string) {
    try {
      if (existsSync(absolutePath)) {
        await unlink(absolutePath);
      }
    } catch {
      // Файл мог быть уже удалён вручную.
      // Для админки это не критично, запись из базы всё равно удаляется.
    }
  }
}
