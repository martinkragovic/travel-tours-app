'use client';

import Link from 'next/link';
import { AdminProtected } from './AdminProtected';
import { AdminShell } from './AdminShell';

const cards = [
  {
    title: 'Заявки',
    description: 'Просмотр заявок, изменение статуса и обработка клиентов.',
    href: '/admin/bookings',
  },
  {
    title: 'Туры',
    description: 'Создание и редактирование туров, описаний, цен и публикации.',
    href: '/admin/tours',
  },
  {
    title: 'Страны',
    description: 'Управление странами для фильтров каталога.',
    href: '/admin/countries',
  },
  {
    title: 'Категории',
    description: 'Управление категориями и типами туристических поездок.',
    href: '/admin/categories',
  },
];

export function AdminDashboard() {
  return (
    <AdminProtected>
      {(user) => (
        <AdminShell user={user}>
          <div className="rounded-2xl bg-[#eeeeec] p-6 shadow-xl">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-black/50">
              Панель управления
            </p>

            <h1 className="mt-3 text-4xl font-black uppercase tracking-wide">
              Админка Mount
            </h1>

            <p className="mt-3 max-w-3xl text-lg font-bold leading-relaxed text-black/70">
              Здесь можно управлять туристическими поездками, заявками,
              странами, категориями, датами туров и изображениями.
            </p>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {cards.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="rounded-2xl bg-[#eeeeec] p-6 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl"
              >
                <h2 className="text-2xl font-black uppercase tracking-wide">
                  {card.title}
                </h2>
                <p className="mt-3 font-bold leading-relaxed text-black/70">
                  {card.description}
                </p>

                <span className="mt-5 inline-block rounded bg-[#727735] px-4 py-3 text-xs font-black uppercase tracking-[0.2em] text-white">
                  Открыть
                </span>
              </Link>
            ))}
          </div>
        </AdminShell>
      )}
    </AdminProtected>
  );
}