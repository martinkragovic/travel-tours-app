import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdminTourDto } from './dto/create-admin-tour.dto';
import { GetAdminToursQueryDto } from './dto/get-admin-tours-query.dto';
import { UpdateAdminTourDto } from './dto/update-admin-tour.dto';

@Injectable()
export class ToursService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetAdminToursQueryDto) {
    const page = this.parsePositiveNumber(query.page, 1);
    const limit = this.parsePositiveNumber(query.limit, 10);
    const safeLimit = Math.min(limit, 50);
    const skip = (page - 1) * safeLimit;

    const where = this.buildWhere(query);

    const [items, total] = await Promise.all([
      this.prisma.tour.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: [
          {
            sortOrder: 'asc',
          },
          {
            createdAt: 'desc',
          },
        ],
        select: {
          id: true,
          title: true,
          slug: true,
          shortDescription: true,
          durationDays: true,
          minPrice: true,
          maxParticipants: true,
          difficultyLevel: true,
          averageRating: true,
          reviewsCount: true,
          isPublished: true,
          sortOrder: true,
          createdAt: true,
          updatedAt: true,
          country: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          categories: {
            select: {
              category: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
          images: {
            orderBy: [
              {
                isMain: 'desc',
              },
              {
                sortOrder: 'asc',
              },
            ],
            take: 1,
            select: {
              id: true,
              filePath: true,
              altText: true,
              isMain: true,
            },
          },
          _count: {
            select: {
              dates: true,
              bookings: true,
              images: true,
              reviews: true,
            },
          },
        },
      }),

      this.prisma.tour.count({
        where,
      }),
    ]);

    return {
      items: items.map((tour) => ({
        ...tour,
        categories: tour.categories.map((item) => item.category),
        mainImage: tour.images[0] ?? null,
        images: undefined,
      })),
      meta: {
        page,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async findOne(id: number) {
    const tour = await this.prisma.tour.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        fullDescription: true,
        countryId: true,
        durationDays: true,
        minPrice: true,
        maxParticipants: true,
        difficultyLevel: true,
        whatIncluded: true,
        requirements: true,
        cancellationPolicy: true,
        averageRating: true,
        reviewsCount: true,
        isPublished: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
        country: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
        dates: {
          orderBy: {
            startDate: 'asc',
          },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            price: true,
            totalSeats: true,
            availableSeats: true,
            isAvailable: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        images: {
          orderBy: [
            {
              isMain: 'desc',
            },
            {
              sortOrder: 'asc',
            },
          ],
          select: {
            id: true,
            filePath: true,
            altText: true,
            isMain: true,
            sortOrder: true,
            uploadedAt: true,
          },
        },
      },
    });

    if (!tour) {
      throw new NotFoundException('Тур не найден');
    }

    return {
      ...tour,
      categories: tour.categories.map((item) => item.category),
      categoryIds: tour.categories.map((item) => item.category.id),
      mainImage:
        tour.images.find((image) => image.isMain) ?? tour.images[0] ?? null,
    };
  }

  async create(dto: CreateAdminTourDto) {
    await this.ensureSlugIsUnique(dto.slug);
    await this.ensureCountryExists(dto.countryId);

    if (dto.categoryIds?.length) {
      await this.ensureCategoriesExist(dto.categoryIds);
    }

    const tour = await this.prisma.tour.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        shortDescription: dto.shortDescription,
        fullDescription: dto.fullDescription,
        countryId: dto.countryId,
        durationDays: dto.durationDays,
        minPrice: dto.minPrice,
        maxParticipants: dto.maxParticipants,
        difficultyLevel: dto.difficultyLevel,
        whatIncluded: dto.whatIncluded,
        requirements: dto.requirements,
        cancellationPolicy: dto.cancellationPolicy,
        isPublished: dto.isPublished ?? false,
        sortOrder: dto.sortOrder ?? 0,
        categories: dto.categoryIds?.length
          ? {
              create: dto.categoryIds.map((categoryId) => ({
                categoryId,
              })),
            }
          : undefined,
      },
      select: this.getFullTourSelect(),
    });

    return {
      message: 'Тур создан',
      tour: this.mapTour(tour),
    };
  }

  async update(id: number, dto: UpdateAdminTourDto) {
    await this.ensureTourExists(id);

    if (dto.slug) {
      await this.ensureSlugIsUnique(dto.slug, id);
    }

    if (dto.countryId) {
      await this.ensureCountryExists(dto.countryId);
    }

    if (dto.categoryIds) {
      await this.ensureCategoriesExist(dto.categoryIds);
    }

    const tour = await this.prisma.$transaction(async (tx) => {
      if (dto.categoryIds) {
        await tx.tourCategory.deleteMany({
          where: {
            tourId: id,
          },
        });

        if (dto.categoryIds.length > 0) {
          await tx.tourCategory.createMany({
            data: dto.categoryIds.map((categoryId) => ({
              tourId: id,
              categoryId,
            })),
            skipDuplicates: true,
          });
        }
      }

      return tx.tour.update({
        where: {
          id,
        },
        data: {
          title: dto.title,
          slug: dto.slug,
          shortDescription: dto.shortDescription,
          fullDescription: dto.fullDescription,
          countryId: dto.countryId,
          durationDays: dto.durationDays,
          minPrice: dto.minPrice,
          maxParticipants: dto.maxParticipants,
          difficultyLevel: dto.difficultyLevel,
          whatIncluded: dto.whatIncluded,
          requirements: dto.requirements,
          cancellationPolicy: dto.cancellationPolicy,
          isPublished: dto.isPublished,
          sortOrder: dto.sortOrder,
        },
        select: this.getFullTourSelect(),
      });
    });

    return {
      message: 'Тур обновлён',
      tour: this.mapTour(tour),
    };
  }

  async remove(id: number) {
    const tour = await this.prisma.tour.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            bookings: true,
          },
        },
      },
    });

    if (!tour) {
      throw new NotFoundException('Тур не найден');
    }

    if (tour._count.bookings > 0) {
      throw new BadRequestException(
        'Нельзя удалить тур, у которого есть заявки. Сначала снимите его с публикации.',
      );
    }

    await this.prisma.tour.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Тур удалён',
      id,
    };
  }

  private buildWhere(query: GetAdminToursQueryDto): Prisma.TourWhereInput {
    const where: Prisma.TourWhereInput = {};

    if (query.search) {
      where.OR = [
        {
          title: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          slug: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          shortDescription: {
            contains: query.search,
            mode: 'insensitive',
          },
        },
        {
          country: {
            name: {
              contains: query.search,
              mode: 'insensitive',
            },
          },
        },
      ];
    }

    if (query.countrySlug) {
      where.country = {
        slug: query.countrySlug,
      };
    }

    if (query.categorySlug) {
      where.categories = {
        some: {
          category: {
            slug: query.categorySlug,
          },
        },
      };
    }

    if (query.isPublished === 'true') {
      where.isPublished = true;
    }

    if (query.isPublished === 'false') {
      where.isPublished = false;
    }

    return where;
  }

  private async ensureTourExists(id: number) {
    const tour = await this.prisma.tour.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!tour) {
      throw new NotFoundException('Тур не найден');
    }
  }

  private async ensureSlugIsUnique(slug: string, ignoreTourId?: number) {
    const existingTour = await this.prisma.tour.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (existingTour && existingTour.id !== ignoreTourId) {
      throw new ConflictException('Тур с таким slug уже существует');
    }
  }

  private async ensureCountryExists(countryId: number) {
    const country = await this.prisma.country.findUnique({
      where: {
        id: countryId,
      },
      select: {
        id: true,
      },
    });

    if (!country) {
      throw new BadRequestException('Указанная страна не найдена');
    }
  }

  private async ensureCategoriesExist(categoryIds: number[]) {
    const uniqueCategoryIds = [...new Set(categoryIds)];

    if (uniqueCategoryIds.length !== categoryIds.length) {
      throw new BadRequestException('Список категорий содержит повторы');
    }

    const count = await this.prisma.category.count({
      where: {
        id: {
          in: uniqueCategoryIds,
        },
      },
    });

    if (count !== uniqueCategoryIds.length) {
      throw new BadRequestException('Одна или несколько категорий не найдены');
    }
  }

  private getFullTourSelect() {
    return {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      fullDescription: true,
      countryId: true,
      durationDays: true,
      minPrice: true,
      maxParticipants: true,
      difficultyLevel: true,
      whatIncluded: true,
      requirements: true,
      cancellationPolicy: true,
      averageRating: true,
      reviewsCount: true,
      isPublished: true,
      sortOrder: true,
      createdAt: true,
      updatedAt: true,
      country: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      categories: {
        select: {
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      },
      images: {
        orderBy: [
          {
            isMain: 'desc' as const,
          },
          {
            sortOrder: 'asc' as const,
          },
        ],
        select: {
          id: true,
          filePath: true,
          altText: true,
          isMain: true,
          sortOrder: true,
          uploadedAt: true,
        },
      },
      dates: {
        orderBy: {
          startDate: 'asc' as const,
        },
        select: {
          id: true,
          startDate: true,
          endDate: true,
          price: true,
          totalSeats: true,
          availableSeats: true,
          isAvailable: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    };
  }

  private mapTour(tour: any) {
    return {
      ...tour,
      categories: tour.categories.map((item) => item.category),
      categoryIds: tour.categories.map((item) => item.category.id),
      mainImage:
        tour.images.find((image) => image.isMain) ?? tour.images[0] ?? null,
    };
  }

  private parsePositiveNumber(value: string | undefined, defaultValue: number) {
    if (!value) {
      return defaultValue;
    }

    const parsed = Number(value);

    if (Number.isNaN(parsed) || parsed <= 0) {
      return defaultValue;
    }

    return parsed;
  }
}
