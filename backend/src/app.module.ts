import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';

import { CountriesModule } from './countries/countries.module';
import { CategoriesModule } from './categories/categories.module';
import { ToursModule } from './tours/tours.module';
import { BookingsModule } from './bookings/bookings.module';
import { AuthModule } from './auth/auth.module';

import { BookingsModule as AdminBookingsModule } from './admin/bookings/bookings.module';
import { ToursModule as AdminToursModule } from './admin/tours/tours.module';
import { TourDatesModule as AdminTourDatesModule } from './admin/tour-dates/tour-dates.module';
import { CountriesModule as AdminCountriesModule } from './admin/countries/countries.module';
import { CategoriesModule as AdminCategoriesModule } from './admin/categories/categories.module';
import { TourImagesModule as AdminTourImagesModule } from './admin/tour-images/tour-images.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,

    CountriesModule,
    CategoriesModule,
    ToursModule,
    BookingsModule,
    AuthModule,

    AdminBookingsModule,
    AdminToursModule,
    AdminTourDatesModule,
    AdminCountriesModule,
    AdminCategoriesModule,
    AdminTourImagesModule,
  ],
})
export class AppModule {}
