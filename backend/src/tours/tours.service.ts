import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { GetToursQueryDto } from './dto/get-tours-query.dto';

@Injectable()
export class ToursService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: GetToursQueryDto) {
    const page = this.parsePositiveNumber(query.page, 1);
    const limit = this.parsePositiveNumber(query.limit, 9);

    const safeLimit = Math.min(limit, 50);
    const skip = (page - 1) * safeLimit;

    const where = this.buildToursWhere(query);

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
          dates: {
            where: {
              isAvailable: true,
              availableSeats: {
                gt: 0,
              },
            },
            orderBy: {
              startDate: 'asc',
            },
            take: 1,
            select: {
              id: true,
              startDate: true,
              endDate: true,
              price: true,
              availableSeats: true,
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
        nearestDate: tour.dates[0] ?? null,
        dates: undefined,
      })),
      meta: {
        page,
        limit: safeLimit,
        total,
        totalPages: Math.ceil(total / safeLimit),
      },
    };
  }

  async findOneBySlug(slug: string) {
    const tour = await this.prisma.tour.findFirst({
      where: {
        slug,
        isPublished: true,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        fullDescription: true,
        durationDays: true,
        minPrice: true,
        maxParticipants: true,
        difficultyLevel: true,
        whatIncluded: true,
        requirements: true,
        cancellationPolicy: true,
        averageRating: true,
        reviewsCount: true,
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
          select: {
            id: true,
            filePath: true,
            altText: true,
            isMain: true,
            sortOrder: true,
          },
        },
        dates: {
          where: {
            isAvailable: true,
            availableSeats: {
              gt: 0,
            },
          },
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
          },
        },
        reviews: {
          where: {
            status: 'PUBLISHED',
          },
          orderBy: {
            createdAt: 'desc',
          },
          select: {
            id: true,
            authorName: true,
            rating: true,
            text: true,
            createdAt: true,
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
      mainImage:
        tour.images.find((image) => image.isMain) ?? tour.images[0] ?? null,
    };
  }

  private buildToursWhere(query: GetToursQueryDto): Prisma.TourWhereInput {
    const where: Prisma.TourWhereInput = {
      isPublished: true,
    };

    if (query.search) {
      where.OR = [
        {
          title: {
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
          fullDescription: {
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

    if (query.priceRange) {
      where.minPrice = this.getPriceFilter(query.priceRange);
    }

    if (query.durationRange) {
      where.durationDays = this.getDurationFilter(query.durationRange);
    }

    if (query.peopleRange) {
      where.maxParticipants = this.getPeopleFilter(query.peopleRange);
    }

    return where;
  }

  private getPriceFilter(priceRange: string) {
    switch (priceRange) {
      case 'under_10000':
        return {
          lt: 10000,
        };

      case '10000_20000':
        return {
          gte: 10000,
          lte: 20000,
        };

      case '20000_50000':
        return {
          gte: 20000,
          lte: 50000,
        };

      case '50000_plus':
        return {
          gte: 50000,
        };

      default:
        return undefined;
    }
  }

  private getDurationFilter(durationRange: string) {
    switch (durationRange) {
      case '1_3':
        return {
          gte: 1,
          lte: 3,
        };

      case '3_5':
        return {
          gte: 3,
          lte: 5,
        };

      case '5_10':
        return {
          gte: 5,
          lte: 10,
        };

      default:
        return undefined;
    }
  }

  private getPeopleFilter(peopleRange: string) {
    switch (peopleRange) {
      case '1_2':
        return {
          gte: 1,
          lte: 2,
        };

      case '3_5':
        return {
          gte: 3,
        };

      case '5_10':
        return {
          gte: 5,
        };

      case '10_plus':
        return {
          gte: 10,
        };

      default:
        return undefined;
    }
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
