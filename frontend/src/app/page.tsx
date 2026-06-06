import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Hero } from '@/components/Hero';
import { TourCard } from '@/components/TourCard';
import { TourFilters } from '@/components/TourFilters';
import { getCategories, getCountries, getTours } from '@/lib/api';

type HomePageProps = {
  searchParams: Promise<{
    search?: string;
    countrySlug?: string;
    categorySlug?: string;
    priceRange?: string;
    durationRange?: string;
    peopleRange?: string;
  }>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const params = await searchParams;

  const [toursResponse, countries, categories] = await Promise.all([
    getTours(params),
    getCountries(),
    getCategories(),
  ]);

  return (
    <main>
      <Header />
      <Hero />

      <section id="tours" className="mx-auto max-w-6xl px-6 py-10">
        <h2 className="mb-8 text-center text-2xl font-black uppercase tracking-[0.25em] text-white">
          Все туры
        </h2>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <TourFilters countries={countries} categories={categories} />

          <div className="space-y-5">
            {toursResponse.items.length > 0 ? (
              toursResponse.items.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))
            ) : (
              <div className="rounded-lg bg-[#eeeeec] p-8 text-center">
                <h3 className="text-xl font-black uppercase">
                  Туры не найдены
                </h3>
                <p className="mt-2 font-bold">
                  Попробуйте изменить параметры фильтрации.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <section id="about" className="mx-auto max-w-6xl px-6 pb-16">
        <div className="rounded-lg bg-[#eeeeec] p-8">
          <h2 className="text-2xl font-black uppercase tracking-wide">
            Mount
          </h2>
          <p className="mt-4 max-w-3xl text-lg font-bold leading-relaxed">
            Mount — веб-приложение базы данных туристических поездок. Здесь
            можно найти туры в горы по разным странам, посмотреть описание,
            выбрать даты и оставить заявку на бронирование.
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}