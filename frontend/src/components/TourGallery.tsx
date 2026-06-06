import Image from 'next/image';
import { getImageUrl } from '@/lib/api';
import type { TourImage } from '@/types/api';

type TourGalleryProps = {
  title: string;
  images: TourImage[];
};

export function TourGallery({ title, images }: TourGalleryProps) {
  const mainImage = images.find((image) => image.isMain) ?? images[0] ?? null;
  const secondaryImages = images.filter((image) => image.id !== mainImage?.id);

  return (
    <section className="rounded-2xl bg-[#eeeeec] p-4 shadow-xl">
      <div className="grid gap-3 md:grid-cols-[1fr_220px]">
        <div className="relative h-[280px] overflow-hidden rounded-xl md:h-[430px]">
          <Image
            src={getImageUrl(mainImage?.filePath)}
            alt={mainImage?.altText || title}
            fill
            className="object-cover"
            unoptimized
            priority
          />
        </div>

        <div className="grid gap-3">
          {secondaryImages.slice(0, 2).map((image, index) => (
            <div
              key={image.id}
              className="relative h-[130px] overflow-hidden rounded-xl md:h-auto"
            >
              <Image
                src={getImageUrl(image.filePath)}
                alt={image.altText || title}
                fill
                className="object-cover"
                unoptimized
              />

              {index === 1 && images.length > 3 && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                  <span className="text-2xl font-black uppercase text-white">
                    + {images.length - 2} фото
                  </span>
                </div>
              )}
            </div>
          ))}

          {secondaryImages.length === 0 && (
            <div className="hidden rounded-xl bg-[#d8d8d2] md:block" />
          )}
        </div>
      </div>
    </section>
  );
}