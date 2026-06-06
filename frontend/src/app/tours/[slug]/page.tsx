import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookingForm } from '@/components/BookingForm';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { TourGallery } from '@/components/TourGallery';
import { getTourBySlug } from '@/lib/api';

type TourPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatRating(rating: number) {
  return rating.toFixed(1);
}

function getCountryLabel(countryName: string) {
  return countryName.toLowerCase();
}

export default async function TourPage({ params }: TourPageProps) {
  const { slug } = await params;

  let tour;

  try {
    tour = await getTourBySlug(slug);
  } catch {
    notFound();
  }

  return (
    <main className="min-h-screen bg-[#4f523b]">
      <Header variant="static" />

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-8">
        <div className="mb-6">
          <Link
            href="/#tours"
            className="text-xs font-black uppercase tracking-[0.25em] text-white/80 hover:text-white"
          >
            ← Все туры
          </Link>
        </div>

        <div className="mb-5 rounded-2xl bg-[#eeeeec] p-5 shadow-xl">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="max-w-3xl text-3xl font-black uppercase leading-tight tracking-wide md:text-5xl">
                {tour.title}
              </h1>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm font-black uppercase tracking-wide text-black/70">
                <span>★ {formatRating(tour.averageRating)}</span>
                <span>{tour.reviewsCount} отзывов</span>
                <span>› {getCountryLabel(tour.country.name)}</span>
              </div>
            </div>

            <div className="flex gap-2 text-2xl">
              <span>♡</span>
              <span>💬</span>
            </div>
          </div>
        </div>

        <TourGallery title={tour.title} images={tour.images} />

        <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_320px]">
          <article className="rounded-2xl bg-[#eeeeec] p-6 shadow-xl">
            <p className="whitespace-pre-line text-lg font-bold leading-relaxed">
              {tour.fullDescription}
            </p>

            {tour.whatIncluded && (
              <section className="mt-8">
                <h2 className="mb-4 text-xl font-black uppercase tracking-wide">
                  Что вас ждёт:
                </h2>

                <ul className="space-y-2 text-base font-bold leading-relaxed">
                  {tour.whatIncluded
                    .split(/[.;]/)
                    .map((item) => item.trim())
                    .filter(Boolean)
                    .map((item) => (
                      <li key={item} className="flex gap-2">
                        <span>•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                </ul>
              </section>
            )}

            {tour.requirements && (
              <section className="mt-8">
                <h2 className="mb-3 text-xl font-black uppercase tracking-wide">
                  Требования
                </h2>
                <p className="text-base font-bold leading-relaxed">
                  {tour.requirements}
                </p>
              </section>
            )}

            {tour.cancellationPolicy && (
              <section className="mt-8">
                <h2 className="mb-3 text-xl font-black uppercase tracking-wide">
                  Условия отмены
                </h2>
                <p className="text-base font-bold leading-relaxed">
                  {tour.cancellationPolicy}
                </p>
              </section>
            )}

            {tour.reviews.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-4 text-xl font-black uppercase tracking-wide">
                  Отзывы
                </h2>

                <div className="space-y-3">
                  {tour.reviews.map((review) => (
                    <div key={review.id} className="rounded-xl bg-[#d8d8d2] p-4">
                      <div className="mb-2 flex items-center justify-between gap-4">
                        <h3 className="font-black uppercase">
                          {review.authorName}
                        </h3>
                        <span className="font-black">★ {review.rating}</span>
                      </div>
                      <p className="font-bold leading-relaxed">{review.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </article>

          <BookingForm
            tourId={tour.id}
            minPrice={tour.minPrice}
            dates={tour.dates}
          />
        </div>
      </section>

      <Footer />
    </main>
  );
}