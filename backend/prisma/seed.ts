import 'dotenv/config';
import {
  DifficultyLevel,
  PrismaClient,
  ReviewStatus,
  UserRoleCode,
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  await seedRoles();
  const adminRole = await prisma.role.findUniqueOrThrow({
    where: {
      code: UserRoleCode.ADMIN,
    },
  });

  await seedAdmin(adminRole.id);

  const countries = await seedCountries();
  const categories = await seedCategories();

  await seedTours(countries, categories);

  console.log('Seed completed');
  console.log('Admin login: admin@mount.local');
  console.log('Admin password: admin123');
}

async function seedRoles() {
  await prisma.role.upsert({
    where: { code: UserRoleCode.ADMIN },
    update: {
      name: 'Администратор',
      description: 'Полный доступ к административной панели',
    },
    create: {
      name: 'Администратор',
      code: UserRoleCode.ADMIN,
      description: 'Полный доступ к административной панели',
    },
  });

  await prisma.role.upsert({
    where: { code: UserRoleCode.MANAGER },
    update: {
      name: 'Менеджер',
      description: 'Обработка заявок и бронирований',
    },
    create: {
      name: 'Менеджер',
      code: UserRoleCode.MANAGER,
      description: 'Обработка заявок и бронирований',
    },
  });

  await prisma.role.upsert({
    where: { code: UserRoleCode.USER },
    update: {
      name: 'Пользователь',
      description: 'Обычный пользователь сайта',
    },
    create: {
      name: 'Пользователь',
      code: UserRoleCode.USER,
      description: 'Обычный пользователь сайта',
    },
  });
}

async function seedAdmin(roleId: number) {
  const passwordHash = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: {
      email: 'admin@mount.local',
    },
    update: {
      name: 'Администратор',
      passwordHash,
      roleId,
    },
    create: {
      name: 'Администратор',
      email: 'admin@mount.local',
      passwordHash,
      roleId,
    },
  });
}

async function seedCountries() {
  const russia = await prisma.country.upsert({
    where: { slug: 'russia' },
    update: {
      name: 'Россия',
      isActive: true,
      sortOrder: 1,
    },
    create: {
      name: 'Россия',
      slug: 'russia',
      isActive: true,
      sortOrder: 1,
    },
  });

  const georgia = await prisma.country.upsert({
    where: { slug: 'georgia' },
    update: {
      name: 'Грузия',
      isActive: true,
      sortOrder: 2,
    },
    create: {
      name: 'Грузия',
      slug: 'georgia',
      isActive: true,
      sortOrder: 2,
    },
  });

  const turkey = await prisma.country.upsert({
    where: { slug: 'turkey' },
    update: {
      name: 'Турция',
      isActive: true,
      sortOrder: 3,
    },
    create: {
      name: 'Турция',
      slug: 'turkey',
      isActive: true,
      sortOrder: 3,
    },
  });

  const japan = await prisma.country.upsert({
    where: { slug: 'japan' },
    update: {
      name: 'Япония',
      isActive: true,
      sortOrder: 4,
    },
    create: {
      name: 'Япония',
      slug: 'japan',
      isActive: true,
      sortOrder: 4,
    },
  });

  const china = await prisma.country.upsert({
    where: { slug: 'china' },
    update: {
      name: 'Китай',
      isActive: true,
      sortOrder: 5,
    },
    create: {
      name: 'Китай',
      slug: 'china',
      isActive: true,
      sortOrder: 5,
    },
  });

  return {
    russia,
    georgia,
    turkey,
    japan,
    china,
  };
}

async function seedCategories() {
  const trekking = await prisma.category.upsert({
    where: { slug: 'trekking' },
    update: {
      name: 'Треккинг',
      description: 'Пешие маршруты по горам и природным локациям',
      isActive: true,
      sortOrder: 1,
    },
    create: {
      name: 'Треккинг',
      slug: 'trekking',
      description: 'Пешие маршруты по горам и природным локациям',
      isActive: true,
      sortOrder: 1,
    },
  });

  const climbing = await prisma.category.upsert({
    where: { slug: 'climbing' },
    update: {
      name: 'Восхождение',
      description: 'Горные восхождения разной сложности',
      isActive: true,
      sortOrder: 2,
    },
    create: {
      name: 'Восхождение',
      slug: 'climbing',
      description: 'Горные восхождения разной сложности',
      isActive: true,
      sortOrder: 2,
    },
  });

  const weekend = await prisma.category.upsert({
    where: { slug: 'weekend' },
    update: {
      name: 'Тур выходного дня',
      description: 'Короткие путешествия на 1-3 дня',
      isActive: true,
      sortOrder: 3,
    },
    create: {
      name: 'Тур выходного дня',
      slug: 'weekend',
      description: 'Короткие путешествия на 1-3 дня',
      isActive: true,
      sortOrder: 3,
    },
  });

  const expedition = await prisma.category.upsert({
    where: { slug: 'expedition' },
    update: {
      name: 'Экспедиция',
      description: 'Продолжительные маршруты с насыщенной программой',
      isActive: true,
      sortOrder: 4,
    },
    create: {
      name: 'Экспедиция',
      slug: 'expedition',
      description: 'Продолжительные маршруты с насыщенной программой',
      isActive: true,
      sortOrder: 4,
    },
  });

  const sightseeing = await prisma.category.upsert({
    where: { slug: 'sightseeing' },
    update: {
      name: 'Экскурсионный тур',
      description: 'Путешествия с акцентом на культуру и достопримечательности',
      isActive: true,
      sortOrder: 5,
    },
    create: {
      name: 'Экскурсионный тур',
      slug: 'sightseeing',
      description: 'Путешествия с акцентом на культуру и достопримечательности',
      isActive: true,
      sortOrder: 5,
    },
  });

  return {
    trekking,
    climbing,
    weekend,
    expedition,
    sightseeing,
  };
}

async function seedTours(
  countries: Awaited<ReturnType<typeof seedCountries>>,
  categories: Awaited<ReturnType<typeof seedCategories>>,
) {
  await createTourWithRelations({
    title: 'Легенды Фишта: 3 дня в сердце Кавказа',
    slug: 'legendy-fishta',
    shortDescription:
      'Трёхдневный маршрут по живописным местам Кавказа с видами на гору Фишт.',
    fullDescription:
      'Этот тур подойдёт тем, кто хочет познакомиться с Кавказскими горами, увидеть живописные тропы, альпийские луга и насладиться атмосферой активного отдыха. В программе — прогулки по природным маршрутам, красивые панорамы, отдых на свежем воздухе и сопровождение опытного инструктора.',
    countryId: countries.russia.id,
    categoryIds: [categories.trekking.id, categories.weekend.id],
    durationDays: 3,
    minPrice: 18000,
    maxParticipants: 10,
    difficultyLevel: DifficultyLevel.MEDIUM,
    whatIncluded:
      'Горные виды, сопровождение инструктора, маршрут по природным достопримечательностям, фотографии и активный отдых.',
    requirements:
      'Средний уровень физической подготовки. Специальный альпинистский опыт не требуется.',
    cancellationPolicy:
      'Бесплатная отмена возможна не позднее чем за 7 дней до начала тура.',
    averageRating: 4.8,
    reviewsCount: 12,
    isPublished: true,
    sortOrder: 1,
    imageSlug: 'fisht',
    dates: [
      {
        startDate: '2026-06-10',
        endDate: '2026-06-12',
        price: 18000,
        totalSeats: 10,
        availableSeats: 10,
      },
      {
        startDate: '2026-07-05',
        endDate: '2026-07-07',
        price: 19500,
        totalSeats: 10,
        availableSeats: 8,
      },
    ],
    reviews: [
      {
        authorName: 'Анна',
        rating: 5,
        text: 'Очень красивый маршрут, отлично подошёл для первого горного тура.',
      },
      {
        authorName: 'Максим',
        rating: 5,
        text: 'Понравилась организация и виды. Тур насыщенный, но без перегруза.',
      },
    ],
  });

  await createTourWithRelations({
    title: 'Эльбрус: восхождение для начинающих',
    slug: 'elbrus-beginner',
    shortDescription:
      'Маршрут к Эльбрусу для тех, кто хочет попробовать себя в горах.',
    fullDescription:
      'Тур подойдёт путешественникам, которые хотят познакомиться с атмосферой высокогорья и пройти маршрут с постепенной акклиматизацией. Программа включает инструктаж, сопровождение и консультации по подготовке.',
    countryId: countries.russia.id,
    categoryIds: [categories.climbing.id, categories.expedition.id],
    durationDays: 5,
    minPrice: 45000,
    maxParticipants: 8,
    difficultyLevel: DifficultyLevel.HARD,
    whatIncluded:
      'Инструктаж, сопровождение, консультации по снаряжению, акклиматизационные выходы.',
    requirements:
      'Хорошая физическая форма и отсутствие противопоказаний к активным нагрузкам.',
    cancellationPolicy:
      'Бесплатная отмена возможна не позднее чем за 14 дней до начала тура.',
    averageRating: 4.7,
    reviewsCount: 9,
    isPublished: true,
    sortOrder: 2,
    imageSlug: 'elbrus',
    dates: [
      {
        startDate: '2026-06-20',
        endDate: '2026-06-24',
        price: 45000,
        totalSeats: 8,
        availableSeats: 8,
      },
      {
        startDate: '2026-08-01',
        endDate: '2026-08-05',
        price: 49000,
        totalSeats: 8,
        availableSeats: 6,
      },
    ],
    reviews: [
      {
        authorName: 'Игорь',
        rating: 5,
        text: 'Сложно, но очень интересно. Инструктор всё объяснял понятно.',
      },
    ],
  });

  await createTourWithRelations({
    title: 'Казбек: горная Грузия',
    slug: 'kazbek-georgia',
    shortDescription: 'Путешествие к одной из самых известных гор Кавказа.',
    fullDescription:
      'Маршрут проходит по живописным районам Грузии и знакомит участников с горными пейзажами, атмосферой Кавказа и активным форматом отдыха. Подходит для тех, кто хочет увидеть Казбек и пройти насыщенный маршрут.',
    countryId: countries.georgia.id,
    categoryIds: [categories.trekking.id, categories.climbing.id],
    durationDays: 5,
    minPrice: 42000,
    maxParticipants: 8,
    difficultyLevel: DifficultyLevel.HARD,
    whatIncluded:
      'Маршрут по горным районам, сопровождение, консультация по подготовке.',
    requirements:
      'Хорошая физическая форма и готовность к длительным переходам.',
    cancellationPolicy:
      'Условия отмены обсуждаются с менеджером при бронировании.',
    averageRating: 4.7,
    reviewsCount: 8,
    isPublished: true,
    sortOrder: 3,
    imageSlug: 'kazbek',
    dates: [
      {
        startDate: '2026-07-12',
        endDate: '2026-07-16',
        price: 42000,
        totalSeats: 8,
        availableSeats: 8,
      },
      {
        startDate: '2026-09-03',
        endDate: '2026-09-07',
        price: 44000,
        totalSeats: 8,
        availableSeats: 5,
      },
    ],
    reviews: [
      {
        authorName: 'Дарья',
        rating: 5,
        text: 'Грузия невероятная. Маршрут красивый, виды стоят всех усилий.',
      },
    ],
  });

  await createTourWithRelations({
    title: 'Арарат: легендарная вершина',
    slug: 'ararat',
    shortDescription: 'Насыщенный тур к одной из самых узнаваемых гор региона.',
    fullDescription:
      'Тур рассчитан на путешественников, которые хотят пройти необычный маршрут, увидеть величественные горные пейзажи и познакомиться с природой региона. Программа подходит для участников с хорошей физической подготовкой.',
    countryId: countries.turkey.id,
    categoryIds: [categories.climbing.id, categories.expedition.id],
    durationDays: 6,
    minPrice: 52000,
    maxParticipants: 10,
    difficultyLevel: DifficultyLevel.HARD,
    whatIncluded:
      'Маршрут, сопровождение, консультация по подготовке, организационная поддержка.',
    requirements:
      'Хорошая физическая форма, готовность к длительным переходам и перепадам высоты.',
    cancellationPolicy: 'Бесплатная отмена возможна за 14 дней до начала тура.',
    averageRating: 4.6,
    reviewsCount: 6,
    isPublished: true,
    sortOrder: 4,
    imageSlug: 'ararat',
    dates: [
      {
        startDate: '2026-07-20',
        endDate: '2026-07-25',
        price: 52000,
        totalSeats: 10,
        availableSeats: 10,
      },
    ],
    reviews: [
      {
        authorName: 'Сергей',
        rating: 4,
        text: 'Хорошая программа, маршрут требует подготовки.',
      },
    ],
  });

  await createTourWithRelations({
    title: 'Фудзияма: символ Японии',
    slug: 'fuji',
    shortDescription:
      'Тур к знаменитой горе Фудзи с природными и культурными локациями.',
    fullDescription:
      'Путешествие к знаменитой горе Фудзи с культурной программой и красивыми природными локациями. Тур подойдёт тем, кто хочет совместить активный отдых, фотографии, прогулки и знакомство с атмосферой Японии.',
    countryId: countries.japan.id,
    categoryIds: [categories.trekking.id, categories.sightseeing.id],
    durationDays: 4,
    minPrice: 65000,
    maxParticipants: 12,
    difficultyLevel: DifficultyLevel.MEDIUM,
    whatIncluded:
      'Посещение природных локаций, сопровождение, знакомство с культурой региона.',
    requirements:
      'Базовая физическая подготовка и готовность к пешим прогулкам.',
    cancellationPolicy: 'Отмена возможна согласно условиям бронирования.',
    averageRating: 4.9,
    reviewsCount: 15,
    isPublished: true,
    sortOrder: 5,
    imageSlug: 'fuji',
    dates: [
      {
        startDate: '2026-08-10',
        endDate: '2026-08-13',
        price: 65000,
        totalSeats: 12,
        availableSeats: 12,
      },
      {
        startDate: '2026-09-15',
        endDate: '2026-09-18',
        price: 69000,
        totalSeats: 12,
        availableSeats: 9,
      },
    ],
    reviews: [
      {
        authorName: 'Мария',
        rating: 5,
        text: 'Очень красивый тур. Понравилось сочетание природы и культуры.',
      },
    ],
  });
}

type TourSeedData = {
  title: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  countryId: number;
  categoryIds: number[];
  durationDays: number;
  minPrice: number;
  maxParticipants: number;
  difficultyLevel: DifficultyLevel;
  whatIncluded: string;
  requirements: string;
  cancellationPolicy: string;
  averageRating: number;
  reviewsCount: number;
  isPublished: boolean;
  sortOrder: number;
  imageSlug: string;
  dates: {
    startDate: string;
    endDate: string;
    price: number;
    totalSeats: number;
    availableSeats: number;
  }[];
  reviews: {
    authorName: string;
    rating: number;
    text: string;
  }[];
};

async function createTourWithRelations(data: TourSeedData) {
  const tour = await prisma.tour.upsert({
    where: {
      slug: data.slug,
    },
    update: {
      title: data.title,
      shortDescription: data.shortDescription,
      fullDescription: data.fullDescription,
      countryId: data.countryId,
      durationDays: data.durationDays,
      minPrice: data.minPrice,
      maxParticipants: data.maxParticipants,
      difficultyLevel: data.difficultyLevel,
      whatIncluded: data.whatIncluded,
      requirements: data.requirements,
      cancellationPolicy: data.cancellationPolicy,
      averageRating: data.averageRating,
      reviewsCount: data.reviewsCount,
      isPublished: data.isPublished,
      sortOrder: data.sortOrder,
    },
    create: {
      title: data.title,
      slug: data.slug,
      shortDescription: data.shortDescription,
      fullDescription: data.fullDescription,
      countryId: data.countryId,
      durationDays: data.durationDays,
      minPrice: data.minPrice,
      maxParticipants: data.maxParticipants,
      difficultyLevel: data.difficultyLevel,
      whatIncluded: data.whatIncluded,
      requirements: data.requirements,
      cancellationPolicy: data.cancellationPolicy,
      averageRating: data.averageRating,
      reviewsCount: data.reviewsCount,
      isPublished: data.isPublished,
      sortOrder: data.sortOrder,
    },
  });

  await prisma.tourCategory.deleteMany({
    where: {
      tourId: tour.id,
    },
  });

  await prisma.tourCategory.createMany({
    data: data.categoryIds.map((categoryId) => ({
      tourId: tour.id,
      categoryId,
    })),
    skipDuplicates: true,
  });

  await prisma.tourDate.deleteMany({
    where: {
      tourId: tour.id,
    },
  });

  await prisma.tourDate.createMany({
    data: data.dates.map((date) => ({
      tourId: tour.id,
      startDate: new Date(date.startDate),
      endDate: new Date(date.endDate),
      price: date.price,
      totalSeats: date.totalSeats,
      availableSeats: date.availableSeats,
      isAvailable: true,
    })),
  });

  await prisma.tourImage.deleteMany({
    where: {
      tourId: tour.id,
    },
  });

  await prisma.tourImage.createMany({
    data: [
      {
        tourId: tour.id,
        filePath: `/uploads/tour-images/placeholder-${data.imageSlug}-main.jpg`,
        altText: `${data.title} — главное изображение`,
        isMain: true,
        sortOrder: 0,
      },
      {
        tourId: tour.id,
        filePath: `/uploads/tour-images/placeholder-${data.imageSlug}-1.jpg`,
        altText: `${data.title} — дополнительное фото 1`,
        isMain: false,
        sortOrder: 1,
      },
      {
        tourId: tour.id,
        filePath: `/uploads/tour-images/placeholder-${data.imageSlug}-2.jpg`,
        altText: `${data.title} — дополнительное фото 2`,
        isMain: false,
        sortOrder: 2,
      },
    ],
  });

  await prisma.review.deleteMany({
    where: {
      tourId: tour.id,
    },
  });

  await prisma.review.createMany({
    data: data.reviews.map((review) => ({
      tourId: tour.id,
      authorName: review.authorName,
      rating: review.rating,
      text: review.text,
      status: ReviewStatus.PUBLISHED,
    })),
  });

  return tour;
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
