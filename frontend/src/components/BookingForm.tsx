'use client';

import { FormEvent, useMemo, useState } from 'react';
import { createBooking } from '@/lib/api';
import type { TourDate } from '@/types/api';

type BookingFormProps = {
  tourId: number;
  minPrice: number;
  dates: TourDate[];
};

function formatPrice(price: number) {
  return new Intl.NumberFormat('ru-RU').format(price);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date));
}

export function BookingForm({ tourId, minPrice, dates }: BookingFormProps) {
  const firstDate = dates[0];

  const [tourDateId, setTourDateId] = useState(
    firstDate ? String(firstDate.id) : '',
  );
  const [participants, setParticipants] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerComment, setCustomerComment] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const selectedDate = useMemo(() => {
    return dates.find((date) => String(date.id) === tourDateId) ?? null;
  }, [dates, tourDateId]);

  const pricePerPerson = selectedDate?.price ?? minPrice;
  const totalPrice = pricePerPerson * participants;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccessMessage('');
    setErrorMessage('');

    if (!tourDateId) {
      setErrorMessage('Выберите дату тура');
      return;
    }

    if (!customerPhone && !customerEmail) {
      setErrorMessage('Укажите телефон или email');
      return;
    }

    try {
      setIsLoading(true);

      await createBooking({
        tourId,
        tourDateId: Number(tourDateId),
        customerName,
        customerPhone: customerPhone || undefined,
        customerEmail: customerEmail || undefined,
        participants,
        customerComment: customerComment || undefined,
      });

      setSuccessMessage('Заявка успешно отправлена. Мы свяжемся с вами.');
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setCustomerComment('');
      setParticipants(1);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Не удалось отправить заявку',
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <aside className="sticky top-6 rounded-2xl bg-[#eeeeec] p-5 shadow-xl">
      <div className="mb-5">
        <p className="text-sm font-black uppercase tracking-widest text-black/60">
          от
        </p>
        <p className="text-4xl font-black uppercase tracking-wide">
          ₽{formatPrice(minPrice)}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <label className="block">
          <span className="mb-1 block text-xs font-black uppercase tracking-wide">
            Выберите даты
          </span>
          <select
            value={tourDateId}
            onChange={(event) => setTourDateId(event.target.value)}
            className="w-full rounded border border-black/20 bg-white px-3 py-3 text-sm font-bold outline-none"
            required
          >
            {dates.length === 0 && <option value="">Нет доступных дат</option>}

            {dates.map((date) => (
              <option key={date.id} value={date.id}>
                {formatDate(date.startDate)} — {formatDate(date.endDate)}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-black uppercase tracking-wide">
            Участников
          </span>
          <input
            type="number"
            min={1}
            max={selectedDate?.availableSeats ?? 99}
            value={participants}
            onChange={(event) => setParticipants(Number(event.target.value))}
            className="w-full rounded border border-black/20 bg-white px-3 py-3 text-sm font-bold outline-none"
            required
          />
        </label>

        <div className="rounded bg-[#d8d8d2] px-3 py-3">
          <p className="text-xs font-black uppercase tracking-wide text-black/60">
            Итого
          </p>
          <p className="text-2xl font-black">₽{formatPrice(totalPrice)}</p>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-black uppercase tracking-wide">
            Ваше имя
          </span>
          <input
            type="text"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            className="w-full rounded border border-black/20 bg-white px-3 py-3 text-sm font-bold outline-none"
            required
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-black uppercase tracking-wide">
            Телефон
          </span>
          <input
            type="tel"
            value={customerPhone}
            onChange={(event) => setCustomerPhone(event.target.value)}
            className="w-full rounded border border-black/20 bg-white px-3 py-3 text-sm font-bold outline-none"
            placeholder="+7..."
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-black uppercase tracking-wide">
            Email
          </span>
          <input
            type="email"
            value={customerEmail}
            onChange={(event) => setCustomerEmail(event.target.value)}
            className="w-full rounded border border-black/20 bg-white px-3 py-3 text-sm font-bold outline-none"
            placeholder="mail@example.com"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-black uppercase tracking-wide">
            Комментарий
          </span>
          <textarea
            value={customerComment}
            onChange={(event) => setCustomerComment(event.target.value)}
            className="min-h-24 w-full resize-none rounded border border-black/20 bg-white px-3 py-3 text-sm font-bold outline-none"
            placeholder="Например, хочу уточнить детали тура"
          />
        </label>

        {errorMessage && (
          <div className="rounded bg-red-100 px-3 py-2 text-sm font-bold text-red-700">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="rounded bg-green-100 px-3 py-2 text-sm font-bold text-green-700">
            {successMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || dates.length === 0}
          className="w-full rounded bg-[#727735] px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#3d4129] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? 'Отправка...' : 'Купить тур'}
        </button>

        <p className="text-center text-xs font-black uppercase tracking-wide text-black/60">
          Полная отмена в течение 24 часов
        </p>
      </form>
    </aside>
  );
}