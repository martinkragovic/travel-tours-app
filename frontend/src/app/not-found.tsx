import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#4f523b] px-6">
      <div className="max-w-xl rounded-2xl bg-[#eeeeec] p-8 text-center shadow-xl">
        <h1 className="text-4xl font-black uppercase">Тур не найден</h1>
        <p className="mt-4 text-lg font-bold">
          Возможно, тур был снят с публикации или адрес страницы указан неверно.
        </p>

        <Link
          href="/#tours"
          className="mt-6 inline-block rounded bg-[#727735] px-6 py-4 text-sm font-black uppercase tracking-[0.2em] text-white transition hover:bg-[#3d4129]"
        >
          Вернуться к турам
        </Link>
      </div>
    </main>
  );
}