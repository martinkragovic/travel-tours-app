'use client';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#4f523b] px-6">
      <div className="max-w-xl rounded-2xl bg-[#eeeeec] p-8 text-center shadow-xl">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-black/50">
          Ошибка
        </p>

        <h1 className="mt-3 text-3xl font-black uppercase">
          Что-то пошло не так
        </h1>

        <p className="mt-4 text-sm font-bold leading-relaxed text-black/70">
          {error.message || 'Не удалось загрузить страницу.'}
        </p>

        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded bg-[#727735] px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#3d4129]"
        >
          Попробовать снова
        </button>
      </div>
    </main>
  );
}