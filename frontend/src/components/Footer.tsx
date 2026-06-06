import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-[#333722] px-6 py-8 text-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link
            href="/"
            className="text-sm font-black uppercase tracking-[0.35em]"
          >
            Mount
          </Link>

          <p className="mt-2 text-sm font-bold text-white/70">
            Веб-приложение базы данных туристических поездок.
          </p>
        </div>

        <div className="flex flex-wrap gap-4 text-xs font-black uppercase tracking-[0.2em] text-white/70">
          <Link href="/#tours">Все туры</Link>
          <Link href="/#about">О проекте</Link>
          <Link href="/admin">Админка</Link>
        </div>
      </div>
    </footer>
  );
}