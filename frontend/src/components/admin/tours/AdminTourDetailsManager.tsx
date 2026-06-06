'use client';

import Image from 'next/image';
import Link from 'next/link';
import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  createAdminTourDate,
  deleteAdminTourDate,
  deleteAdminTourImage,
  getAdminTourById,
  getCategories,
  getCountries,
  getImageUrl,
  updateAdminTour,
  updateAdminTourDate,
  updateAdminTourImage,
  uploadAdminTourImages,
} from '@/lib/api';
import { getAdminToken } from '@/lib/auth-token';
import type {
  AdminTourDetails,
  AdminTourPayload,
  Category,
  Country,
  DifficultyLevel,
  TourDate,
  TourImage,
} from '@/types/api';

const difficultyOptions: {
  label: string;
  value: DifficultyLevel;
}[] = [
  { label: 'Лёгкий', value: 'EASY' },
  { label: 'Средний', value: 'MEDIUM' },
  { label: 'Сложный', value: 'HARD' },
  { label: 'Экстремальный', value: 'EXTREME' },
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

type DateFormState = {
  id?: number;
  startDate: string;
  endDate: string;
  price: number;
  totalSeats: number;
  availableSeats: number;
  isAvailable: boolean;
};

const emptyDateForm: DateFormState = {
  startDate: '',
  endDate: '',
  price: 0,
  totalSeats: 10,
  availableSeats: 10,
  isAvailable: true,
};

function formatPrice(price: number) {
  return new Intl.NumberFormat('ru-RU').format(price);
}

function toInputDate(value: string) {
  return value.slice(0, 10);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

export function AdminTourDetailsManager() {
  const params = useParams<{ id: string }>();
  const tourId = Number(params.id);

  const [tour, setTour] = useState<AdminTourDetails | null>(null);
  const [form, setForm] = useState<AdminTourPayload>(emptyForm);

  const [countries, setCountries] = useState<Country[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const [dateForm, setDateForm] = useState<DateFormState>(emptyDateForm);
  const [imageAltText, setImageAltText] = useState('');
  const [imageIsMain, setImageIsMain] = useState(false);
  const [imageSortOrder, setImageSortOrder] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [isSavingMain, setIsSavingMain] = useState(false);
  const [isSavingDate, setIsSavingDate] = useState(false);
  const [isUploadingImages, setIsUploadingImages] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function loadTour() {
    const token = getAdminToken();

    if (!token) {
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const [tourResponse, countriesResponse, categoriesResponse] =
        await Promise.all([
          getAdminTourById(token, tourId),
          getCountries(),
          getCategories(),
        ]);

      setTour(tourResponse);
      setCountries(countriesResponse);
      setCategories(categoriesResponse);

      setForm({
        title: tourResponse.title,
        slug: tourResponse.slug,
        shortDescription: tourResponse.shortDescription,
        fullDescription: tourResponse.fullDescription,
        countryId: tourResponse.countryId,
        categoryIds: tourResponse.categoryIds,
        durationDays: tourResponse.durationDays,
        minPrice: tourResponse.minPrice,
        maxParticipants: tourResponse.maxParticipants,
        difficultyLevel: tourResponse.difficultyLevel,
        whatIncluded: tourResponse.whatIncluded ?? '',
        requirements: tourResponse.requirements ?? '',
        cancellationPolicy: tourResponse.cancellationPolicy ?? '',
        isPublished: tourResponse.isPublished,
        sortOrder: tourResponse.sortOrder,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Не удалось загрузить тур',
      );
    } finally {
      setIsLoading(false);
    }
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

  async function handleSaveMain(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = getAdminToken();

    if (!token) {
      return;
    }

    try {
      setIsSavingMain(true);
      setErrorMessage('');
      setSuccessMessage('');

      await updateAdminTour(token, tourId, {
        ...form,
        whatIncluded: form.whatIncluded || undefined,
        requirements: form.requirements || undefined,
        cancellationPolicy: form.cancellationPolicy || undefined,
      });

      setSuccessMessage('Основные данные тура сохранены');
      await loadTour();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Не удалось сохранить тур',
      );
    } finally {
      setIsSavingMain(false);
    }
  }

  function startEditDate(date: TourDate) {
    setDateForm({
      id: date.id,
      startDate: toInputDate(date.startDate),
      endDate: toInputDate(date.endDate),
      price: date.price ?? form.minPrice,
      totalSeats: date.totalSeats ?? date.availableSeats,
      availableSeats: date.availableSeats,
      isAvailable: date.isAvailable ?? true,
    });
  }

  function resetDateForm() {
    setDateForm(emptyDateForm);
  }

  async function handleSaveDate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = getAdminToken();

    if (!token) {
      return;
    }

    try {
      setIsSavingDate(true);
      setErrorMessage('');
      setSuccessMessage('');

      const payload = {
        startDate: dateForm.startDate,
        endDate: dateForm.endDate,
        price: dateForm.price,
        totalSeats: dateForm.totalSeats,
        availableSeats: dateForm.availableSeats,
        isAvailable: dateForm.isAvailable,
      };

      if (dateForm.id) {
        await updateAdminTourDate(token, dateForm.id, payload);
        setSuccessMessage('Дата тура обновлена');
      } else {
        await createAdminTourDate(token, tourId, payload);
        setSuccessMessage('Дата тура добавлена');
      }

      resetDateForm();
      await loadTour();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Не удалось сохранить дату',
      );
    } finally {
      setIsSavingDate(false);
    }
  }

  async function handleDeleteDate(dateId: number) {
    const confirmed = window.confirm('Удалить дату тура?');

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

      await deleteAdminTourDate(token, dateId);

      setSuccessMessage('Дата тура удалена');
      await loadTour();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Не удалось удалить дату',
      );
    }
  }

  async function handleUploadImages(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = getAdminToken();

    if (!token || !selectedFiles || selectedFiles.length === 0) {
      setErrorMessage('Выберите изображения для загрузки');
      return;
    }

    try {
      setIsUploadingImages(true);
      setErrorMessage('');
      setSuccessMessage('');

      await uploadAdminTourImages(token, tourId, {
        images: selectedFiles,
        altText: imageAltText,
        isMain: imageIsMain,
        sortOrder: imageSortOrder,
      });

      setSuccessMessage('Изображения загружены');
      setImageAltText('');
      setImageIsMain(false);
      setImageSortOrder(0);
      setSelectedFiles(null);

      const input = document.getElementById(
        'tour-images-input',
      ) as HTMLInputElement | null;

      if (input) {
        input.value = '';
      }

      await loadTour();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Не удалось загрузить изображения',
      );
    } finally {
      setIsUploadingImages(false);
    }
  }

  async function handleSetMainImage(image: TourImage) {
    const token = getAdminToken();

    if (!token) {
      return;
    }

    try {
      setErrorMessage('');
      setSuccessMessage('');

      await updateAdminTourImage(token, image.id, {
        isMain: true,
      });

      setSuccessMessage('Главное изображение обновлено');
      await loadTour();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Не удалось обновить изображение',
      );
    }
  }

  async function handleDeleteImage(image: TourImage) {
    const confirmed = window.confirm('Удалить изображение?');

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

      await deleteAdminTourImage(token, image.id);

      setSuccessMessage('Изображение удалено');
      await loadTour();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Не удалось удалить изображение',
      );
    }
  }

  useEffect(() => {
    loadTour();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tourId]);

  if (isLoading) {
    return (
      <div className="rounded-2xl bg-[#eeeeec] p-8 text-center shadow-xl">
        <p className="text-xl font-black uppercase">Загружаем тур...</p>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="rounded-2xl bg-[#eeeeec] p-8 text-center shadow-xl">
        <h1 className="text-3xl font-black uppercase">Тур не найден</h1>
        <Link
          href="/admin/tours"
          className="mt-6 inline-block rounded bg-[#727735] px-5 py-3 text-sm font-black uppercase text-white"
        >
          Вернуться к турам
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-2xl bg-[#eeeeec] p-6 shadow-xl">
        <Link
          href="/admin/tours"
          className="text-xs font-black uppercase tracking-[0.25em] text-black/50 hover:text-black"
        >
          ← Назад к турам
        </Link>

        <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-black/50">
              Редактирование тура #{tour.id}
            </p>

            <h1 className="mt-2 text-4xl font-black uppercase tracking-wide">
              {tour.title}
            </h1>

            <p className="mt-2 text-sm font-bold text-black/60">
              /{tour.slug} · {tour.country.name} ·{' '}
              {tour.isPublished ? 'Опубликован' : 'Черновик'}
            </p>
          </div>

          <Link
            href={`/tours/${tour.slug}`}
            target="_blank"
            className="rounded bg-black px-5 py-3 text-sm font-black uppercase tracking-wide text-white"
          >
            Открыть на сайте
          </Link>
        </div>
      </div>

      {(errorMessage || successMessage) && (
        <div className="mt-6">
          {errorMessage && (
            <div className="rounded bg-red-100 px-4 py-3 text-sm font-bold text-red-700">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="rounded bg-green-100 px-4 py-3 text-sm font-bold text-green-700">
              {successMessage}
            </div>
          )}
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="rounded-2xl bg-[#eeeeec] p-5 shadow-xl">
          <h2 className="mb-4 text-2xl font-black uppercase">
            Основные данные
          </h2>

          <form onSubmit={handleSaveMain} className="space-y-3">
            <TextField
              label="Название"
              value={form.title}
              onChange={(value) => updateForm('title', value)}
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
              rows={3}
            />

            <TextareaField
              label="Полное описание"
              value={form.fullDescription}
              onChange={(value) => updateForm('fullDescription', value)}
              required
              rows={6}
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
              label="Что вас ждёт"
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
              disabled={isSavingMain}
              className="w-full rounded bg-[#727735] px-4 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#3d4129] disabled:opacity-60"
            >
              {isSavingMain ? 'Сохраняем...' : 'Сохранить основные данные'}
            </button>
          </form>
        </section>

        <aside className="space-y-6">
          <section className="rounded-2xl bg-[#eeeeec] p-5 shadow-xl">
            <h2 className="mb-4 text-2xl font-black uppercase">Даты тура</h2>

            <form onSubmit={handleSaveDate} className="space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <DateField
                  label="Дата начала"
                  value={dateForm.startDate}
                  onChange={(value) =>
                    setDateForm((current) => ({
                      ...current,
                      startDate: value,
                    }))
                  }
                />

                <DateField
                  label="Дата окончания"
                  value={dateForm.endDate}
                  onChange={(value) =>
                    setDateForm((current) => ({
                      ...current,
                      endDate: value,
                    }))
                  }
                />
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                <NumberField
                  label="Цена"
                  value={dateForm.price}
                  min={0}
                  onChange={(value) =>
                    setDateForm((current) => ({
                      ...current,
                      price: value,
                    }))
                  }
                />

                <NumberField
                  label="Всего мест"
                  value={dateForm.totalSeats}
                  min={1}
                  onChange={(value) =>
                    setDateForm((current) => ({
                      ...current,
                      totalSeats: value,
                    }))
                  }
                />

                <NumberField
                  label="Свободно"
                  value={dateForm.availableSeats}
                  min={0}
                  onChange={(value) =>
                    setDateForm((current) => ({
                      ...current,
                      availableSeats: value,
                    }))
                  }
                />
              </div>

              <label className="flex items-center gap-3 rounded bg-[#d8d8d2] px-4 py-3">
                <input
                  type="checkbox"
                  checked={dateForm.isAvailable}
                  onChange={(event) =>
                    setDateForm((current) => ({
                      ...current,
                      isAvailable: event.target.checked,
                    }))
                  }
                />
                <span className="text-sm font-black uppercase">
                  Доступна для бронирования
                </span>
              </label>

              <div className="grid gap-3 md:grid-cols-2">
                <button
                  type="submit"
                  disabled={isSavingDate}
                  className="rounded bg-[#727735] px-4 py-3 text-sm font-black uppercase text-white disabled:opacity-60"
                >
                  {isSavingDate
                    ? 'Сохраняем...'
                    : dateForm.id
                      ? 'Сохранить дату'
                      : 'Добавить дату'}
                </button>

                <button
                  type="button"
                  onClick={resetDateForm}
                  className="rounded bg-black px-4 py-3 text-sm font-black uppercase text-white"
                >
                  Очистить
                </button>
              </div>
            </form>

            <div className="mt-5 space-y-3">
              {tour.dates.length === 0 ? (
                <div className="rounded-xl bg-[#d8d8d2] p-4 text-center font-black uppercase">
                  Дат пока нет
                </div>
              ) : (
                tour.dates.map((date) => (
                  <div key={date.id} className="rounded-xl bg-[#d8d8d2] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-black uppercase">
                          {formatDate(date.startDate)} —{' '}
                          {formatDate(date.endDate)}
                        </p>

                        <p className="mt-1 text-sm font-bold text-black/60">
                          ₽{formatPrice(date.price ?? form.minPrice)} · мест:{' '}
                          {date.availableSeats}/{date.totalSeats ?? '—'} ·{' '}
                          {date.isAvailable ? 'доступна' : 'закрыта'}
                        </p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => startEditDate(date)}
                          className="rounded bg-[#727735] px-3 py-2 text-xs font-black uppercase text-white"
                        >
                          Изменить
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteDate(date.id)}
                          className="rounded bg-black px-3 py-2 text-xs font-black uppercase text-white"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl bg-[#eeeeec] p-5 shadow-xl">
            <h2 className="mb-4 text-2xl font-black uppercase">Изображения</h2>

            <form onSubmit={handleUploadImages} className="space-y-3">
              <label className="block">
                <span className="mb-1 block text-xs font-black uppercase tracking-wide">
                  Файлы
                </span>
                <input
                  id="tour-images-input"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  multiple
                  onChange={(event) => setSelectedFiles(event.target.files)}
                  className="w-full rounded border border-black/20 bg-white px-4 py-3 text-sm font-bold outline-none"
                />
              </label>

              <TextField
                label="Alt-текст"
                value={imageAltText}
                onChange={setImageAltText}
              />

              <div className="grid gap-3 md:grid-cols-2">
                <NumberField
                  label="Порядок"
                  value={imageSortOrder}
                  onChange={setImageSortOrder}
                />

                <label className="flex items-center gap-3 rounded bg-[#d8d8d2] px-4 py-3">
                  <input
                    type="checkbox"
                    checked={imageIsMain}
                    onChange={(event) => setImageIsMain(event.target.checked)}
                  />
                  <span className="text-sm font-black uppercase">
                    Сделать главным
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isUploadingImages}
                className="w-full rounded bg-[#727735] px-4 py-3 text-sm font-black uppercase text-white disabled:opacity-60"
              >
                {isUploadingImages ? 'Загружаем...' : 'Загрузить изображения'}
              </button>
            </form>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {tour.images.length === 0 ? (
                <div className="rounded-xl bg-[#d8d8d2] p-4 text-center font-black uppercase sm:col-span-2">
                  Изображений пока нет
                </div>
              ) : (
                tour.images.map((image) => (
                  <div
                    key={image.id}
                    className="overflow-hidden rounded-xl bg-[#d8d8d2]"
                  >
                    <div className="relative h-40">
                      <Image
                        src={getImageUrl(image.filePath)}
                        alt={image.altText || tour.title}
                        fill
                        unoptimized
                        className="object-cover"
                      />

                      {image.isMain && (
                        <div className="absolute left-2 top-2 rounded bg-[#727735] px-2 py-1 text-xs font-black uppercase text-white">
                          Главное
                        </div>
                      )}
                    </div>

                    <div className="space-y-2 p-3">
                      <p className="break-words text-xs font-bold text-black/60">
                        {image.altText || 'Без alt-текста'}
                      </p>

                      <div className="grid gap-2">
                        {!image.isMain && (
                          <button
                            type="button"
                            onClick={() => handleSetMainImage(image)}
                            className="rounded bg-[#727735] px-3 py-2 text-xs font-black uppercase text-white"
                          >
                            Сделать главным
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteImage(image)}
                          className="rounded bg-black px-3 py-2 text-xs font-black uppercase text-white"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
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

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase tracking-wide">
        {label}
      </span>
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded border border-black/20 bg-white px-4 py-3 text-sm font-bold outline-none"
        required
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