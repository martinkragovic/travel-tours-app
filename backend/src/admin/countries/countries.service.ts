import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

@Injectable()
export class CountriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.country.findMany({
      orderBy: [
        {
          sortOrder: 'asc',
        },
        {
          name: 'asc',
        },
      ],
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            tours: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const country = await this.prisma.country.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
        tours: {
          select: {
            id: true,
            title: true,
            slug: true,
            isPublished: true,
          },
          orderBy: {
            title: 'asc',
          },
        },
      },
    });

    if (!country) {
      throw new NotFoundException('Страна не найдена');
    }

    return country;
  }

  async create(dto: CreateCountryDto) {
    await this.ensureSlugIsUnique(dto.slug);

    const country = await this.prisma.country.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder ?? 0,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Страна создана',
      country,
    };
  }

  async update(id: number, dto: UpdateCountryDto) {
    await this.ensureCountryExists(id);

    if (dto.slug) {
      await this.ensureSlugIsUnique(dto.slug, id);
    }

    const country = await this.prisma.country.update({
      where: {
        id,
      },
      data: {
        name: dto.name,
        slug: dto.slug,
        isActive: dto.isActive,
        sortOrder: dto.sortOrder,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        isActive: true,
        sortOrder: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      message: 'Страна обновлена',
      country,
    };
  }

  async remove(id: number) {
    const country = await this.prisma.country.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        _count: {
          select: {
            tours: true,
          },
        },
      },
    });

    if (!country) {
      throw new NotFoundException('Страна не найдена');
    }

    if (country._count.tours > 0) {
      throw new BadRequestException(
        'Нельзя удалить страну, которая используется в турах. Можно сделать её неактивной.',
      );
    }

    await this.prisma.country.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Страна удалена',
      id,
    };
  }

  private async ensureCountryExists(id: number) {
    const country = await this.prisma.country.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!country) {
      throw new NotFoundException('Страна не найдена');
    }
  }

  private async ensureSlugIsUnique(slug: string, ignoreCountryId?: number) {
    const existingCountry = await this.prisma.country.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (existingCountry && existingCountry.id !== ignoreCountryId) {
      throw new ConflictException('Страна с таким slug уже существует');
    }
  }
}
