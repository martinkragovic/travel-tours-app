'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { loginAdmin } from '@/lib/api';
import { saveAdminToken } from '@/lib/auth-token';

export function AdminLoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState('admin@mount.local');
  const [password, setPassword] = useState('admin123');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErrorMessage('');

    try {
      setIsLoading(true);

      const response = await loginAdmin({
        email,
        password,
      });

      saveAdminToken(response.accessToken);

      router.push('/admin');
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Не удалось войти в админку',
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#4f523b] px-6 py-10">
      <div className="w-full max-w-md rounded-2xl bg-[#eeeeec] p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-sm font-black uppercase tracking-[0.35em] text-black/70"
          >
            Mount
          </Link>

          <h1 className="mt-6 text-3xl font-black uppercase tracking-wide">
            Вход в админку
          </h1>

          <p className="mt-2 text-sm font-bold text-black/60">
            Управление турами, заявками и справочниками
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs font-black uppercase tracking-wide">
              Email
            </span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded border border-black/20 bg-white px-4 py-3 text-sm font-bold outline-none transition focus:border-[#727735]"
              required
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-black uppercase tracking-wide">
              Пароль
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded border border-black/20 bg-white px-4 py-3 text-sm font-bold outline-none transition focus:border-[#727735]"
              required
            />
          </label>

          {errorMessage && (
            <div className="rounded bg-red-100 px-4 py-3 text-sm font-bold text-red-700">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded bg-[#727735] px-5 py-4 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#3d4129] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </button>
        </form>

        <div className="mt-6 rounded bg-[#d8d8d2] p-4 text-sm font-bold">
          <p className="font-black uppercase">Тестовый администратор</p>
          <p className="mt-2">Email: admin@mount.local</p>
          <p>Пароль: admin123</p>
        </div>

        <Link
          href="/"
          className="mt-6 block text-center text-xs font-black uppercase tracking-[0.2em] text-black/60 hover:text-black"
        >
          ← На сайт
        </Link>
      </div>
    </main>
  );
}