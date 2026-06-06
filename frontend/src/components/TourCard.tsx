import Image from 'next/image';
import Link from 'next/link';
import { getImageUrl } from '@/lib/api';
import type { TourListItem } from '@/types/api';

type TourCardProps = {
  tour: TourListItem;
};

function formatPrice(price: number) {
  if (price >= 1000) {
    return `от ${Math.round(price / 1000)} тыс. руб`;
  }

  return `от ${price} руб`;
}

function formatDays(days: number) {
  if (days === 1) {
    return '1 день';
  }

  if (days >= 2 && days <= 4) {
    return `${days} дня`;
  }

  return `${days} дней`;
}

export function TourCard({ tour }: TourCardProps) {
  const imageUrl = getImageUrl(tour.mainImage?.filePath);

  return (
    <Link
      href={`/tours/${tour.slug}`}
      className="grid overflow-hidden rounded-lg bg-[#eeeeec] shadow-lg transition hover:-translate-y-1 hover:shadow-2xl md:grid-cols-[230px_1fr]"
    >
      <div className="relative h-52 md:h-full">
        <Image
          src={imageUrl}
          alt={tour.mainImage?.altText || tour.title}
          fill
          className="object-cover"
          unoptimized
        />

        <div className="absolute inset-x-0 bottom-0 bg-black/45 px-4 py-3">
          <h3 className="text-xl font-black uppercase tracking-wide text-white">
            {tour.title.split(':')[0]}
          </h3>
        </div>
      </div>

      <div className="flex min-h-[210px] flex-col justify-between p-5">
        <div>
          <p className="text-sm font-black uppercase leading-relaxed tracking-wide text-black">
            {tour.shortDescription}
          </p>
        </div>

        <div className="mt-6 flex items-center justify-between gap-4 text-lg font-black uppercase tracking-wide">
          <span>{formatDays(tour.durationDays)}</span>
          <span>{formatPrice(tour.minPrice)}</span>
        </div>
      </div>
    </Link>
  );
}