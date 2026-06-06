'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { removeAdminToken } from '@/lib/auth-token';
import type { AdminUser } from '@/types/api';

type AdminShellProps = {
  user: AdminUser;
  children: React.ReactNode;
};

const navItems = [
  {
    label: 'Обзор',
    href: '/admin',
  },
  {
    label: 'Заявки',
    href: '/admin/bookings',
  },
  {
    label: 'Туры',
    href: '/admin/tours',
  },
  {
    label: 'Страны',
    href: '/admin/countries',
  },
  {
    label: 'Категории',
    href: '/admin/categories',
  },
];

export function AdminShell({ user, children }: AdminShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    removeAdminToken();
    router.push('/admin/login');
  }

  return (
    <main className="min-h-screen bg-[#4f523b]">
      <div className="mx-auto flex min-h-screen max-w-7xl gap-6 px-6 py-6">
        <aside className="hidden w-64 shrink-0 rounded-2xl bg-[#eeeeec] p-5 shadow-xl lg:block">
          <Link
            href="/"
            className="block text-sm font-black uppercase tracking-[0.35em] text-black/70"
          >
            Mount
          </Link>

          <div className="mt-8">
            <p className="text-xs font-black uppercase tracking-wide text-black/50">
              Администратор
            </p>
            <p className="mt-1 font-black">{user.name}</p>
            <p className="text-sm font-bold text-black/60">{user.email}</p>
          </div>

          <nav className="mt-8 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={[
                    'block rounded px-4 py-3 text-sm font-black uppercase tracking-wide transition',
                    isActive
                      ? 'bg-[#727735] text-white'
                      : 'bg-transparent text-black hover:bg-[#d8d8d2]',
                  ].join(' ')}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-8 w-full rounded bg-black px-4 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-[#333333]"
          >
            Выйти
          </button>
        </aside>

        <section className="min-w-0 flex-1">
          <div className="mb-6 rounded-2xl bg-[#eeeeec] p-4 shadow-xl lg:hidden">
            <div className="flex items-center justify-between gap-4">
              <Link
                href="/"
                className="text-sm font-black uppercase tracking-[0.25em]"
              >
                Mount
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="rounded bg-black px-4 py-2 text-xs font-black uppercase tracking-wide text-white"
              >
                Выйти
              </button>
            </div>

            <nav className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
              {navItems.map((item) => {
                const isActive = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={[
                      'rounded px-3 py-2 text-center text-xs font-black uppercase tracking-wide',
                      isActive
                        ? 'bg-[#727735] text-white'
                        : 'bg-[#d8d8d2] text-black',
                    ].join(' ')}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {children}
        </section>
      </div>
    </main>
  );
}