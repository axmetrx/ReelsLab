import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Платформа обучения — ReelsLab LMS',
  description: 'Минималистичная платформа онлайн-курсов.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${inter.variable} font-inter antialiased bg-[#F8FAFC] text-[#0F172A] min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
