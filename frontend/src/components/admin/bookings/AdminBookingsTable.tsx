'use client';

import { FormEvent, useEffect, useState } from 'react';
import {
  deleteAdminBooking,
  getAdminBookingById,
  getAdminBookings,
  updateAdminBookingStatus,
} from '@/lib/api';
import { getAdminToken } from '@/lib/auth-token';
import type {
  AdminBookingDetails,
  AdminBookingListItem,
  BookingStatus,
} from '@/types/api';

const statusOptions: {
  label: string;
  value: BookingStatus | '';
}[] = [
  {
    label: 'Все статусы',
    value: '',
  },
  {
    label: 'Новая',
    value: 'NEW',
  },
  {
    label: 'В работе',
    value: 'IN_PROGRESS',
  },
  {
    label: 'Подтверждена',
    value: 'CONFIRMED',
  },
  {
    label: 'Отменена',
    value: 'CANCELLED',
  },
];

const statusLabels: Record<BookingStatus, string> = {
  NEW: 'Новая',
  IN_PROGRESS: 'В работе',
  CONFIRMED: 'Подтверждена',
  CANCELLED: 'Отменена',
};

function formatPrice(price: number) {
  return new Intl.NumberFormat('ru-RU').format(price);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
}

function formatDateTime(date: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

function getStatusClass(status: BookingStatus) {
  switch (status) {
    case 'NEW':
      return 'bg-blue-100 text-blue-800';
    case 'IN_PROGRESS':
      return 'bg-yellow-100 text-yellow-800';
    case 'CONFIRMED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

export function AdminBookingsTable() {
  const [items, setItems] = useState<AdminBookingListItem[]>([]);
  const [selectedBooking, setSelectedBooking] =
    useState<AdminBookingDetails | null>(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<BookingStatus | ''>('');

  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [editStatus, setEditStatus] = useState<BookingStatus>('NEW');
  const [adminComment, setAdminComment] = useState('');

  async function loadBookings() {
    const token = getAdminToken();

    if (!token) {
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage('');

      const response = await getAdminBookings(token, {
        search,
        status,
        page: 1,
        limit: 50,
      });

      setItems(response.items);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Не удалось загрузить заявки',
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function openBooking(id: number) {
    const token = getAdminToken();

    if (!token) {
      return;
    }

    try {
      setIsDetailsLoading(true);
      setErrorMessage('');

      const booking = await getAdminBookingById(token, id);

      setSelectedBooking(booking);
      setEditStatus(booking.status);
      setAdminComment(booking.adminComment ?? '');
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Не удалось загрузить заявку',
      );
    } finally {
      setIsDetailsLoading(false);
    }
  }

  async function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await loadBookings();
  }

  async function handleUpdateStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedBooking) {
      return;
    }

    const token = getAdminToken();

    if (!token) {
      return;
    }

    try {
      setIsUpdating(true);
      setErrorMessage('');
      setSuccessMessage('');

      await updateAdminBookingStatus(token, selectedBooking.id, {
        status: editStatus,
        adminComment,
      });

      setSuccessMessage('Статус заявки обновлён');

      await loadBookings();
      await openBooking(selectedBooking.id);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Не удалось обновить статус заявки',
      );
    } finally {
      setIsUpdating(false);
    }
  }

  async function handleDeleteBooking(id: number) {
    const confirmed = window.confirm('Удалить эту заявку?');

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

      await deleteAdminBooking(token, id);

      setSuccessMessage('Заявка удалена');

      if (selectedBooking?.id === id) {
        setSelectedBooking(null);
      }

      await loadBookings();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Не удалось удалить заявку',
      );
    }
  }

  useEffect(() => {
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <div className="rounded-2xl bg-[#eeeeec] p-6 shadow-xl">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-black/50">
          Админка
        </p>

        <h1 className="mt-3 text-4xl font-black uppercase tracking-wide">
          Заявки
        </h1>

        <p className="mt-3 max-w-3xl text-lg font-bold leading-relaxed text-black/70">
          Здесь отображаются заявки на бронирование туров. Можно найти заявку,
          открыть детали, изменить статус и оставить комментарий администратора.
        </p>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_420px]">
        <section className="min-w-0 rounded-2xl bg-[#eeeeec] p-5 shadow-xl">
          <form
            onSubmit={handleFilterSubmit}
            className="mb-5 grid gap-3 md:grid-cols-[1fr_220px_140px]"
          >
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Поиск по имени, телефону, email или туру"
              className="rounded border border-black/20 bg-white px-4 py-3 text-sm font-bold outline-none"
            />

            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as BookingStatus | '')
              }
              className="rounded border border-black/20 bg-white px-4 py-3 text-sm font-bold outline-none"
            >
              {statusOptions.map((option) => (
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
              Загружаем заявки...
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-xl bg-[#d8d8d2] p-6 text-center font-black uppercase">
              Заявки не найдены
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[780px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-black/20 text-xs font-black uppercase tracking-wide text-black/60">
                    <th className="px-3 py-3">ID</th>
                    <th className="px-3 py-3">Клиент</th>
                    <th className="px-3 py-3">Тур</th>
                    <th className="px-3 py-3">Дата</th>
                    <th className="px-3 py-3">Сумма</th>
                    <th className="px-3 py-3">Статус</th>
                    <th className="px-3 py-3">Действия</th>
                  </tr>
                </thead>

                <tbody>
                  {items.map((booking) => (
                    <tr
                      key={booking.id}
                      className="border-b border-black/10 text-sm font-bold"
                    >
                      <td className="px-3 py-4">#{booking.id}</td>

                      <td className="px-3 py-4">
                        <p className="font-black">{booking.customerName}</p>
                        <p className="text-xs text-black/60">
                          {booking.customerPhone || booking.customerEmail}
                        </p>
                      </td>

                      <td className="px-3 py-4">
                        <p className="max-w-[220px] truncate">
                          {booking.tour.title}
                        </p>
                        <p className="text-xs text-black/60">
                          {booking.participants} участн.
                        </p>
                      </td>

                      <td className="px-3 py-4">
                        {formatDate(booking.tourDate.startDate)}
                      </td>

                      <td className="px-3 py-4">
                        ₽{formatPrice(booking.totalPrice)}
                      </td>

                      <td className="px-3 py-4">
                        <span
                          className={[
                            'rounded px-2 py-1 text-xs font-black uppercase',
                            getStatusClass(booking.status),
                          ].join(' ')}
                        >
                          {statusLabels[booking.status]}
                        </span>
                      </td>

                      <td className="px-3 py-4">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => openBooking(booking.id)}
                            className="rounded bg-[#727735] px-3 py-2 text-xs font-black uppercase text-white"
                          >
                            Открыть
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteBooking(booking.id)}
                            className="rounded bg-black px-3 py-2 text-xs font-black uppercase text-white"
                          >
                            Удалить
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <aside className="rounded-2xl bg-[#eeeeec] p-5 shadow-xl">
          {!selectedBooking && !isDetailsLoading && (
            <div className="rounded-xl bg-[#d8d8d2] p-6 text-center">
              <h2 className="text-xl font-black uppercase">
                Заявка не выбрана
              </h2>
              <p className="mt-2 font-bold text-black/60">
                Нажмите «Открыть» в таблице, чтобы посмотреть детали.
              </p>
            </div>
          )}

          {isDetailsLoading && (
            <div className="rounded-xl bg-[#d8d8d2] p-6 text-center font-black uppercase">
              Загружаем детали...
            </div>
          )}

          {selectedBooking && (
            <div>
              <div className="mb-5">
                <p className="text-xs font-black uppercase tracking-wide text-black/50">
                  Заявка #{selectedBooking.id}
                </p>

                <h2 className="mt-2 text-2xl font-black uppercase">
                  {selectedBooking.customerName}
                </h2>

                <p className="mt-1 text-sm font-bold text-black/60">
                  Создана: {formatDateTime(selectedBooking.createdAt)}
                </p>
              </div>

              <div className="space-y-3 text-sm font-bold">
                <DetailRow
                  label="Телефон"
                  value={selectedBooking.customerPhone || '—'}
                />
                <DetailRow
                  label="Email"
                  value={selectedBooking.customerEmail || '—'}
                />
                <DetailRow label="Тур" value={selectedBooking.tour.title} />
                <DetailRow
                  label="Дата"
                  value={`${formatDate(
                    selectedBooking.tourDate.startDate,
                  )} — ${formatDate(selectedBooking.tourDate.endDate)}`}
                />
                <DetailRow
                  label="Участников"
                  value={String(selectedBooking.participants)}
                />
                <DetailRow
                  label="Сумма"
                  value={`₽${formatPrice(selectedBooking.totalPrice)}`}
                />
                <DetailRow
                  label="Комментарий клиента"
                  value={selectedBooking.customerComment || '—'}
                />
              </div>

              <form onSubmit={handleUpdateStatus} className="mt-6 space-y-3">
                <label className="block">
                  <span className="mb-1 block text-xs font-black uppercase tracking-wide">
                    Статус
                  </span>
                  <select
                    value={editStatus}
                    onChange={(event) =>
                      setEditStatus(event.target.value as BookingStatus)
                    }
                    className="w-full rounded border border-black/20 bg-white px-4 py-3 text-sm font-bold outline-none"
                  >
                    {statusOptions
                      .filter((option) => option.value)
                      .map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-1 block text-xs font-black uppercase tracking-wide">
                    Комментарий администратора
                  </span>
                  <textarea
                    value={adminComment}
                    onChange={(event) => setAdminComment(event.target.value)}
                    className="min-h-28 w-full resize-none rounded border border-black/20 bg-white px-4 py-3 text-sm font-bold outline-none"
                    placeholder="Например: связались с клиентом"
                  />
                </label>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="w-full rounded bg-[#727735] px-4 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#3d4129] disabled:opacity-60"
                >
                  {isUpdating ? 'Сохраняем...' : 'Сохранить статус'}
                </button>
              </form>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-[#d8d8d2] p-3">
      <p className="text-xs font-black uppercase tracking-wide text-black/50">
        {label}
      </p>
      <p className="mt-1 break-words">{value}</p>
    </div>
  );
}