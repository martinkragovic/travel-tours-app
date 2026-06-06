'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  updateAdminCategory,
} from '@/lib/api';
import { getAdminToken } from '@/lib/auth-token';
import type { AdminCategory, AdminCategoryPayload } from '@/types/api';

const emptyForm: AdminCategoryPayload = {
  name: '',
  slug: '',
  description: '',
  isActive: true,
  sortOrder: 0,
};

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

export function AdminCategoriesManager() {
  const [items, setItems] = useState<AdminCategory[]>([]);
  const [selectedCategory, setSelectedCategory] =
    useState<AdminCategory | null>(null);

  const [form, setForm] = useState<AdminCategoryPayload>(emptyForm);
  const [isCreating, setIsCreating] = useState(true);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  async function loadCategories() {
    const token = getAdminToken();

    if (!token) {
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const response = await getAdminCategories(token);
      setItems(response);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Не удалось загрузить категории',
      );
    } finally {
      setIsLoading(false);
    }
  }

  function startCreate() {
    setSelectedCategory(null);
    setIsCreating(true);
    setForm(emptyForm);
    setErrorMessage('');
    setSuccessMessage('');
  }

  function openCategory(category: AdminCategory) {
    setSelectedCategory(category);
    setIsCreating(false);
    setForm({
      name: category.name,
      slug: category.slug,
      description: category.description ?? '',
      isActive: category.isActive,
      sortOrder: category.sortOrder,
    });
    setErrorMessage('');
    setSuccessMessage('');
  }

  function handleNameChange(value: string) {
    setForm((current) => ({
      ...current,
      name: value,
      slug: isCreating ? slugify(value) : current.slug,
    }));
  }

  async function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const token = getAdminToken();

    if (!token) {
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      const payload: AdminCategoryPayload = {
        ...form,
        description: form.description || undefined,
      };

      if (isCreating) {
        await createAdminCategory(token, payload);
        setSuccessMessage('Категория создана');
        startCreate();
      } else if (selectedCategory) {
        await updateAdminCategory(token, selectedCategory.id, payload);
        setSuccessMessage('Категория обновлена');
      }

      await loadCategories();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Не удалось сохранить категорию',
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleActive(category: AdminCategory) {
    const token = getAdminToken();

    if (!token) {
      return;
    }

    try {
      setErrorMessage('');
      setSuccessMessage('');

      await updateAdminCategory(token, category.id, {
        isActive: !category.isActive,
      });

      setSuccessMessage(
        !category.isActive ? 'Категория активирована' : 'Категория скрыта',
      );

      await loadCategories();

      if (selectedCategory?.id === category.id) {
        setSelectedCategory((current) =>
          current
            ? {
                ...current,
                isActive: !category.isActive,
              }
            : current,
        );

        setForm((current) => ({
          ...current,
          isActive: !category.isActive,
        }));
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Не удалось изменить категорию',
      );
    }
  }

  async function handleDelete(category: AdminCategory) {
    const confirmed = window.confirm(`Удалить категорию "${category.name}"?`);

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

      await deleteAdminCategory(token, category.id);

      setSuccessMessage('Категория удалена');

      if (selectedCategory?.id === category.id) {
        startCreate();
      }

      await loadCategories();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Не удалось удалить категорию',
      );
    }
  }

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div>
      <div className="rounded-2xl bg-[#eeeeec] p-6 shadow-xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-black/50">
              Админка
            </p>

            <h1 className="mt-3 text-4xl font-black uppercase tracking-wide">
              Категории
            </h1>

            <p className="mt-3 max-w-3xl text-lg font-bold leading-relaxed text-black/70">
              Управление категориями туров. Активные категории отображаются в
              публичной части сайта и используются для фильтрации каталога.
            </p>
          </div>

          <button
            type="button"
            onClick={startCreate}
            className="rounded bg-[#727735] px-5 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#3d4129]"
          >
            Новая категория
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="rounded-2xl bg-[#eeeeec] p-5 shadow-xl">
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
              Загружаем категории...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl bg-[#d8d8d2] p-6 text-center font-black uppercase">
              Категории не найдены
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((category) => (
                <div
                  key={category.id}
                  className="rounded-xl bg-[#d8d8d2] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-xl font-black uppercase">
                          {category.name}
                        </h2>

                        <span
                          className={[
                            'rounded px-2 py-1 text-xs font-black uppercase',
                            category.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800',
                          ].join(' ')}
                        >
                          {category.isActive ? 'Активна' : 'Скрыта'}
                        </span>
                      </div>

                      <p className="mt-1 text-sm font-bold text-black/60">
                        /{category.slug} · порядок: {category.sortOrder} ·
                        туров: {category._count?.tours ?? 0}
                      </p>

                      {category.description && (
                        <p className="mt-2 max-w-3xl text-sm font-bold leading-relaxed">
                          {category.description}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => openCategory(category)}
                        className="rounded bg-[#727735] px-3 py-2 text-xs font-black uppercase text-white"
                      >
                        Открыть
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleActive(category)}
                        className="rounded bg-white px-3 py-2 text-xs font-black uppercase text-black"
                      >
                        {category.isActive ? 'Скрыть' : 'Активировать'}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(category)}
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
          <p className="text-xs font-black uppercase tracking-wide text-black/50">
            {isCreating
              ? 'Создание'
              : `Редактирование #${selectedCategory?.id}`}
          </p>

          <h2 className="mt-2 text-2xl font-black uppercase">
            {isCreating ? 'Новая категория' : selectedCategory?.name}
          </h2>

          <form onSubmit={handleSave} className="mt-5 space-y-3">
            <TextField
              label="Название"
              value={form.name}
              onChange={handleNameChange}
              required
            />

            <TextField
              label="Slug"
              value={form.slug}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  slug: value,
                }))
              }
              required
            />

            <TextareaField
              label="Описание"
              value={form.description ?? ''}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  description: value,
                }))
              }
            />

            <NumberField
              label="Порядок сортировки"
              value={form.sortOrder}
              onChange={(value) =>
                setForm((current) => ({
                  ...current,
                  sortOrder: value,
                }))
              }
            />

            <label className="flex items-center gap-3 rounded bg-[#d8d8d2] px-4 py-3">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    isActive: event.target.checked,
                  }))
                }
              />
              <span className="text-sm font-black uppercase">Активна</span>
            </label>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full rounded bg-[#727735] px-4 py-4 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#3d4129] disabled:opacity-60"
            >
              {isSaving
                ? 'Сохраняем...'
                : isCreating
                  ? 'Создать категорию'
                  : 'Сохранить категорию'}
            </button>
          </form>
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
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black uppercase tracking-wide">
        {label}
      </span>
      <input
        type="number"
        value={value}
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
      <textarea
        value={value}
        rows={4}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-none rounded border border-black/20 bg-white px-4 py-3 text-sm font-bold outline-none"
      />
    </label>
  );
}