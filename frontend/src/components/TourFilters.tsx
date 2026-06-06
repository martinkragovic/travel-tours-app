'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import type { Category, Country } from '@/types/api';

type TourFiltersProps = {
  countries: Country[];
  categories: Category[];
};

const priceOptions = [
  { label: 'до 10 тыс.', value: 'under_10000' },
  { label: '10-20 тыс.', value: '10000_20000' },
  { label: '20-50 тыс.', value: '20000_50000' },
  { label: '50 тыс.+', value: '50000_plus' },
];

const durationOptions = [
  { label: '1-3 дня', value: '1_3' },
  { label: '3-5 дней', value: '3_5' },
  { label: '5-10 дней', value: '5_10' },
];

const peopleOptions = [
  { label: '1-2 чел.', value: '1_2' },
  { label: '3-5 чел.', value: '3_5' },
  { label: '5-10 чел.', value: '5_10' },
  { label: '10 чел.+', value: '10_plus' },
];

export function TourFilters({ countries, categories }: TourFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setParam(name: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());

    if (params.get(name) === value) {
      params.delete(name);
    } else {
      params.set(name, value);
    }

    router.push(`/?${params.toString()}#tours`);
  }

  function resetFilters() {
    router.push('/#tours');
  }

  function isActive(name: string, value: string) {
    return searchParams.get(name) === value;
  }

  return (
    <aside className="rounded-lg bg-[#eeeeec] p-5 shadow-lg">
      <FilterGroup title="Цена">
        {priceOptions.map((option) => (
          <FilterCheckbox
            key={option.value}
            label={option.label}
            active={isActive('priceRange', option.value)}
            onClick={() => setParam('priceRange', option.value)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Количество дней">
        {durationOptions.map((option) => (
          <FilterCheckbox
            key={option.value}
            label={option.label}
            active={isActive('durationRange', option.value)}
            onClick={() => setParam('durationRange', option.value)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Страна">
        {countries.map((country) => (
          <FilterCheckbox
            key={country.id}
            label={country.name}
            active={isActive('countrySlug', country.slug)}
            onClick={() => setParam('countrySlug', country.slug)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Категория">
        {categories.map((category) => (
          <FilterCheckbox
            key={category.id}
            label={category.name}
            active={isActive('categorySlug', category.slug)}
            onClick={() => setParam('categorySlug', category.slug)}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Количество людей">
        {peopleOptions.map((option) => (
          <FilterCheckbox
            key={option.value}
            label={option.label}
            active={isActive('peopleRange', option.value)}
            onClick={() => setParam('peopleRange', option.value)}
          />
        ))}
      </FilterGroup>

      <button
        type="button"
        onClick={resetFilters}
        className="mt-4 w-full rounded bg-[#333333] px-4 py-3 text-sm font-black uppercase tracking-widest text-white transition hover:bg-black"
      >
        Сбросить
      </button>
    </aside>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-6 last:mb-0">
      <h3 className="mb-3 text-sm font-black uppercase tracking-wide">
        {title}
      </h3>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FilterCheckbox({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 text-left text-sm font-bold uppercase"
    >
      <span
        className={[
          'flex h-4 w-4 items-center justify-center border border-black',
          active ? 'bg-[#727735]' : 'bg-transparent',
        ].join(' ')}
      >
        {active && <span className="h-2 w-2 bg-white" />}
      </span>
      <span>{label}</span>
    </button>
  );
}