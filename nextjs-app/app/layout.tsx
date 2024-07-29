import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { UIProvider } from '@yamada-ui/react';
import { AppLayout } from '@/components/layouts/app-layout';
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'amo',
  description: 'amo',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <UIProvider>
          <AppLayout>{children}</AppLayout>
        </UIProvider>
      </body>
    </html>
  );
}
