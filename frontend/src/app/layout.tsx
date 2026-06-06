import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mount — туры в горы',
  description: 'Каталог туристических поездок в горы по всему миру',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}