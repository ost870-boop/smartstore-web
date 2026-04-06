import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import ChatWidget from '@/components/ChatWidget';

export const metadata: Metadata = {
  title: '채움수도상사 | 배관자재 전문몰',
  description: '미니멀 배관자재 쇼핑몰 (MVP)',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="bg-white text-gray-900 antialiased font-sans">
        <Navbar />
        <main className="w-full">
          {children}
        </main>
        <ChatWidget />
      </body>
    </html>
  );
}
