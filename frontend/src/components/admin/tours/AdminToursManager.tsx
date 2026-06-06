'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import {
  createAdminTour,
  deleteAdminTour,
  getAdminTourById,
  getAdminTours,
  getCategories,
  getCountries,
  updateAdminTour,
} from '@/lib/api';
import { getAdminToken } from '@/lib/auth-token';
import type {
  AdminTourDetails,
  AdminTourListItem,
  AdminTourPayload,
  Category,
  Country,
  DifficultyLevel,
} from '@/types/api';

const difficultyOptions: {
  label: string;
  value: DifficultyLevel;
}[] = [
  {
    label: 'Лёгкий',
    value: 'EASY',
  },
  {
    label: 'Средний',
    value: 'MEDIUM',
  },
  {
    label: 'Сложный',
    value: 'HARD',
  },
  {
    label: 'Экстремальный',
    value: 'EXTREME',
  },
];

const publishedOptions = [
  {
    label: 'Все',
    value: '',
  },
  {
    label: 'Опубликованные',
    value: 'true',
  },
  {
    label: 'Черновики',
    value: 'false',
  },
];

const emptyForm: AdminTourPayload = {
  title: '',
  slug: '',
  shortDescription: '',
  fullDescription: '',
  countryId: 0,
  categoryIds: [],
  durationDays: 1,
  minPrice: 0,
  maxParticipants: 1,
  difficultyLevel: 'MEDIUM',
  whatIncluded: '',
  requirements: '',
  cancellationPolicy: '',
  isPublished: false,
  sortOrder: 0,
};

function formatPrice(price: number) {
  return new Intl.NumberFormat('ru-RU').format(price);
}

function difficultyLabel(value: DifficultyLevel) {
  return (
    difficultyOptions.find((option) => option.value === value)?.label ?? value
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/ё/g, 'e')
    .replace(/й/g, 'i')
    .replace(/ц/g, 'c')
    .replace(/у/g, 'u')
    .replace(/к/g, 'k')
    .replace(/е/g, 'e')
    .replace(/н/g, 'n')
    .replace(/г/g, 'g')
    .replace(/ш/g, 'sh')
    .replace(/щ/g, 'sch')
    .replace(/з/g, 'z')
    .replace(/х/g, 'h')
    .replace(/ъ/g, '')
    .replace(/ф/g, 'f')
    .replace(/ы/g, 'y')
    .replace(/в/g, 'v')
    .replace(/а/g, 'a')
    .replace(/п/g, 'p')
    .replace(/р/g, 'r')
    .replace(/о/g, 'o')
    .replace(/л/g, 'l')
    .replace(/д/g, 'd')
    .replace(/ж/g, 'zh')
    .replace(/э/g, 'e')
    .replace(/я/g, 'ya')
    .replace(/ч/g, 'ch')
    .replace(/с/g, 's')
    .replace(/м/g, 'm')
    .replace(/и/g, 'i')
    .replace(/т/g, 't')
    .replace(/ь/g, '')
    .replace(/б/g, 'b')
    .replace(/ю/g, 'yu')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function AdminToursManager() {
  const [items, setItems] = useState<AdminTourListItem[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [selectedTour, setSelectedTour] = useState<AdminTourDetails | null>(
    null,
  );

  const [form, setForm] = useState<AdminTourPayload>(emptyForm);
  const [isCreating, setIsCreating] = useState(true);

  const [search, setSearch] = useState('');
  const [isPublished, setIsPublished] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function loadInitialData() {
    const token = getAdminToken();

    if (!token) {
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const [toursResponse, countriesResponse, categoriesResponse] =
        await Promise.all([
          getAdminTours(token, {
            search,
            isPublished,
            page: 1,
            limit: 50,
          }),
          getCountries(),
          getCategories(),
        ]);

      setItems(toursResponse.items);
      setCountries(countriesResponse);
      setCategories(categoriesResponse);

      if (countriesResponse.length > 0 && form.countryId === 0) {
        setForm((current) => ({
          ...current,
          countryId: countriesResponse[0].id,
        }));
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Не удалось загрузить туры',
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function loadTours() {
    const token = getAdminToken();

    if (!token) {
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const response = await getAdminTours(token, {
        search,
        isPublished,
        page: 1,
        limit: 50,
      });

      setItems(response.items);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Не удалось загрузить туры',
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function openTour(id: number) {
    const token = getAdminToken();

    if (!token) {
      return;
    }

    try {
      setIsDetailsLoading(true);
      setErrorMessage('');
      setSuccessMessage('');

      const tour = await getAdminTourById(token, id);

      setSelectedTour(tour);
      setIsCreating(false);

      setForm({
        title: tour.title,
        slug: tour.slug,
        shortDescription: tour.shortDescription,
        fullDescription: tour.fullDescription,
        countryId: tour.countryId,
        categoryIds: tour.categoryIds,
        durationDays: tour.durationDays,
        minPrice: tour.minPrice,
        maxParticipants: tour.maxParticipants,
        difficultyLevel: tour.difficultyLevel,
        whatIncluded: tour.whatIncluded ?? '',
        requirements: tour.requirements ?? '',
        cancellationPolicy: tour.cancellationPolicy ?? '',
        isPublished: tour.isPublished,
        sortOrder: tour.sortOrder,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Не удалось загрузить тур',
      );
    } finally {
      setIsDetailsLoading(false);
    }
  }

  function startCreate() {
    setSelectedTour(null);
    setIsCreating(true);
    setSuccessMessage('');
    setErrorMessage('');

    setForm({
      ...emptyForm,
      countryId: countries[0]?.id ?? 0,
    });
  }

  function updateForm<K extends keyof AdminTourPayload>(
    key: K,
    value: AdminTourPayload[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleTitleChange(value: string) {
    setForm((current) => ({
      ...current,
      title: value,
      slug: isCreating ? slugify(value) : current.slug,
    }));
  }

  function toggleCategory(categoryId: number) {
    setForm((current) => {
      const exists = current.categoryIds.includes(categoryId);

      return {
        ...current,
        categoryIds: exists
          ? current.categoryIds.filter((id) => id !== categoryId)
          : [...current.categoryIds, categoryId],
      };
    });
  }

  async function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadTours();
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = getAdminToken();

    if (!token) {
      return;
    }

    if (!form.countryId) {
      setErrorMessage('Выберите страну');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      const payload: AdminTourPayload = {
        ...form,
        whatIncluded: form.whatIncluded || undefined,
        requirements: form.requirements || undefined,
        cancellationPolicy: form.cancellationPolicy || undefined,
      };

      if (isCreating) {
        const response = await createAdminTour(token, payload);

        setSuccessMessage('Тур создан');
        await loadTours();

        if (response?.tour?.id) {
          await openTour(response.tour.id);
        } else {
          startCreate();
        }
      } else if (selectedTour) {
        await updateAdminTour(token, selectedTour.id, payload);

        setSuccessMessage('Тур обновлён');
        await loadTours();
        await openTour(selectedTour.id);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Не удалось сохранить тур',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleTogglePublished(tour: AdminTourListItem) {
    const token = getAdminToken();

    if (!token) {
      return;
    }

    try {
      setErrorMessage('');
      setSuccessMessage('');

      await updateAdminTour(token, tour.id, {
        isPublished: !tour.isPublished,
      });

      setSuccessMessage(
        !tour.isPublished ? 'Тур опубликован' : 'Тур снят с публикации',
      );

      await loadTours();

      if (selectedTour?.id === tour.id) {
        await openTour(tour.id);
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Не удалось изменить статус',
      );
    }
  }

  async function handleDeleteTour(tour: AdminTourListItem) {
    const confirmed = window.confirm(`Удалить тур "${tour.title}"?`);

    if (!confirmed) {
      return;
    }

    const token = getAdminToken();

    if (!token) {
      return;
    }

    try {
      setErrorMessage('');
      setSuccessMessage('');

      await deleteAdminTour(token, tour.id);

      setSuccessMessage('Тур удалён');

      if (selectedTour?.id === tour.id) {
        startCreate();
      }

      await loadTours();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Не удалось удалить тур',
      );
    }
  }

  useEffect(() => {
      loadInitialData();
      // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="rounded-2xl bg-[#eeeeec] p-6 shadow-xl">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-black/50">
          Админка
        </p>

        <div className="mt-3 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-wide">
              Туры
            </h1>

            <p className="mt-3 max-w-3xl text-lg font-bold leading-relaxed text-black/70">
              Создание и редактирование туристических поездок. Здесь
              настраиваются название, slug, страна, категории, цена, сложность,
              публикация и порядок отображения.
            </p>
          </div>

          <button
            type="button"
            onClick={startCreate}
            className="rounded bg-[#727735] px-5 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#3d4129]"
          >
            Новый тур
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_460px]">
        <section className="min-w-0 rounded-2xl bg-[#eeeeec] p-5 shadow-xl">
          <form
            onSubmit={handleFilterSubmit}
            className="mb-5 grid gap-3 md:grid-cols-[1fr_220px_140px]"
          >
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Поиск по названию, slug или стране"
              className="rounded border border-black/20 bg-white px-4 py-3 text-sm font-bold outline-none"
            />

            <select
              value={isPublished}
              onChange={(event) => setIsPublished(event.target.value)}
              className="rounded border border-black/20 bg-white px-4 py-3 text-sm font-bold outline-none"
            >
              {publishedOptions.map((option) => (
                <option key={option.label} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="rounded bg-[#727735] px-4 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#3d4129]"
            >
              Найти
            </button>
          </form>

          {errorMessage && (
            <div className="mb-4 rounded bg-red-100 px-4 py-3 text-sm font-bold text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mb-4 rounded bg-green-100 px-4 py-3 text-sm font-bold text-green-700">
              {successMessage}
            </div>
          )}

          {isLoading ? (
            <div className="rounded-xl bg-[#d8d8d2] p-6 text-center font-black uppercase">
              Загружаем туры...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl bg-[#d8d8d2] p-6 text-center font-black uppercase">
              Туры не найдены
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((tour) => (
                <div
                  key={tour.id}
                  className="rounded-xl bg-[#d8d8d2] p-4 shadow-sm"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-black uppercase">
                          {tour.title}
                        </h2>

                        <span
                          className={[
                            'rounded px-2 py-1 text-xs font-black uppercase',
                            tour.isPublished
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800',
                          ].join(' ')}
                        >
                          {tour.isPublished ? 'Опубликован' : 'Черновик'}
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-bold text-black/60">
                        /{tour.slug} · {tour.country.name} ·{' '}
                        {difficultyLabel(tour.difficultyLevel)}
                      </p>

                      <p className="mt-2 line-clamp-2 max-w-3xl text-sm font-bold leading-relaxed">
                        {tour.shortDescription}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-black uppercase text-black/60">
                        <span>{tour.durationDays} дн.</span>
                        <span>₽{formatPrice(tour.minPrice)}</span>
                        <span>{tour.maxParticipants} чел.</span>
                        <span>дат: {tour._count.dates}</span>
                        <span>фото: {tour._count.images}</span>
                        <span>заявок: {tour._count.bookings}</span>
                      </div>
                    </div>

                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Link
                        href={`/admin/tours/${tour.id}`}
                        className="rounded bg-[#727735] px-3 py-2 text-xs font-black uppercase text-white"
                      >
                        Открыть
                      </Link>

                      <button
                        type="button"
                        onClick={() => handleTogglePublished(tour)}
                        className="rounded bg-white px-3 py-2 text-xs font-black uppercase text-black"
                      >
                        {tour.isPublished ? 'Снять' : 'Опубликовать'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTour(tour)}
                        className="rounded bg-black px-3 py-2 text-xs font-black uppercase text-white"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="rounded-2xl bg-[#eeeeec] p-5 shadow-xl">
          <div className="mb-5">
            <p className="text-xs font-black uppercase tracking-wide text-black/50">
              {isCreating ? 'Создание' : `Редактирование #${selectedTour?.id}`}
            </p>

            <h2 className="mt-2 text-2xl font-black uppercase">
              {isCreating ? 'Новый тур' : selectedTour?.title}
            </h2>

            {!isCreating && selectedTour && (
              <p className="mt-1 text-sm font-bold text-black/60">
                Даты: {selectedTour.dates.length} · Фото:{' '}
                {selectedTour.images.length}
              </p>
            )}
          </div>

          {isDetailsLoading ? (
            <div className="rounded-xl bg-[#d8d8d2] p-6 text-center font-black uppercase">
              Загружаем тур...
            </div>
          ) : (
            <form onSubmit={handleSave} className="space-y-3">
              <TextField
                label="Название"
                value={form.title}
                onChange={handleTitleChange}
                required
              />

              <TextField
                label="Slug"
                value={form.slug}
                onChange={(value) => updateForm('slug', value)}
                required
              />

              <TextareaField
                label="Краткое описание"
                value={form.shortDescription}
                onChange={(value) => updateForm('shortDescription', value)}
                required
              />

              <TextareaField
                label="Полное описание"
                value={form.fullDescription}
                onChange={(value) => updateForm('fullDescription', value)}
                required
                rows={5}
              />

              <div className="grid gap-3 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-black uppercase tracking-wide">
                    Страна
                  </span>
                  <select
                    value={form.countryId}
                    onChange={(event) =>
                      updateForm('countryId', Number(event.target.value))
                    }
                    className="w-full rounded border border-black/20 bg-white px-4 py-3 text-sm font-bold outline-none"
                    required
                  >
                    {countries.map((country) => (
                      <option key={country.id} value={country.id}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-black uppercase tracking-wide">
                    Сложность
                  </span>
                  <select
                    value={form.difficultyLevel}
                    onChange={(event) =>
                      updateForm(
                        'difficultyLevel',
                        event.target.value as DifficultyLevel,
                      )
                    }
                    className="w-full rounded border border-black/20 bg-white px-4 py-3 text-sm font-bold outline-none"
                  >
                    {difficultyOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div>
                <p className="mb-2 text-xs font-black uppercase tracking-wide">
                  Категории
                </p>

                <div className="grid gap-2 sm:grid-cols-2">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => toggleCategory(category.id)}
                      className={[
                        'rounded border px-3 py-2 text-left text-xs font-black uppercase transition',
                        form.categoryIds.includes(category.id)
                          ? 'border-[#727735] bg-[#727735] text-white'
                          : 'border-black/20 bg-white text-black',
                      ].join(' ')}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <NumberField
                  label="Дней"
                  value={form.durationDays}
                  min={1}
                  onChange={(value) => updateForm('durationDays', value)}
                />

                <NumberField
                  label="Цена"
                  value={form.minPrice}
                  min={0}
                  onChange={(value) => updateForm('minPrice', value)}
                />

                <NumberField
                  label="Участников"
                  value={form.maxParticipants}
                  min={1}
                  onChange={(value) => updateForm('maxParticipants', value)}
                />
              </div>

              <TextareaField
                label="Что включено / что вас ждёт"
                value={form.whatIncluded ?? ''}
                onChange={(value) => updateForm('whatIncluded', value)}
                rows={3}
              />

              <TextareaField
                label="Требования"
                value={form.requirements ?? ''}
                onChange={(value) => updateForm('requirements', value)}
                rows={3}
              />

              <TextareaField
                label="Условия отмены"
                value={form.cancellationPolicy ?? ''}
                onChange={(value) => updateForm('cancellationPolicy', value)}
                rows={3}
              />

              <div className="grid gap-3 md:grid-cols-2">
                <NumberField
                  label="Порядок"
                  value={form.sortOrder}
                  onChange={(value) => updateForm('sortOrder', value)}
                />

                <label className="flex items-center gap-3 rounded bg-[#d8d8d2] px-4 py-3">
                  <input
                    type="checkbox"
                    checked={form.isPublished}
                    onChange={(event) =>
                      updateForm('isPublished', event.target.checked)
                    }
                  />
                  <span className="text-sm font-black uppercase">
                    Опубликован
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSaving}
                className="w-full rounded bg-[#727735] px-4 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#3d4129] disabled:opacity-60"
              >
                {isSaving
                  ? 'Сохраняем...'
                  : isCreating
                    ? 'Создать тур'
                    : 'Сохранить изменения'}
              </button>
            </form>
          )}
        </aside>
      </div>
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  required,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase tracking-wide">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded border border-black/20 bg-white px-4 py-3 text-sm font-bold outline-none"
        required={required}
      />
    </label>
  );
}

function NumberField({
  label,
  value,
  onChange,
  min,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase tracking-wide">
        {label}
      </span>
      <input
        type="number"
        value={value}
        min={min}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full rounded border border-black/20 bg-white px-4 py-3 text-sm font-bold outline-none"
      />
    </label>
  );
}

function TextareaField({
  label,
  value,
  onChange,
  required,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase tracking-wide">
        {label}
      </span>
      <textarea
        value={value}
        rows={rows}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-none rounded border border-black/20 bg-white px-4 py-3 text-sm font-bold outline-none"
        required={required}
      />
    </label>
  );
}