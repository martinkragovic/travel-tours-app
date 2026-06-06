import Link from 'next/link';

type HeaderProps = {
  variant?: 'absolute' | 'static';
};

export function Header({ variant = 'absolute' }: HeaderProps) {
  const isAbsolute = variant === 'absolute';

  return (
    <header
      className={[
        isAbsolute
          ? 'absolute left-0 top-0 z-20 w-full'
          : 'sticky top-0 z-20 w-full bg-[#4f523b]/95 backdrop-blur',
      ].join(' ')}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
        <Link
          href="/"
          className="text-sm font-black uppercase tracking-[0.35em] text-white"
        >
          Mount
        </Link>

        <nav className="hidden items-center gap-8 text-xs font-bold uppercase tracking-[0.25em] text-white/90 md:flex">
          <Link href="/#tours">Все туры</Link>
          <Link href="/#about">О проекте</Link>
          <Link href="/admin">Админка</Link>
        </nav>
      </div>
    </header>
  );
}