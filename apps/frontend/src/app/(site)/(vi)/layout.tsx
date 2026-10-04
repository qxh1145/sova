import type { ReactNode } from 'react';
import '@/styles/globals.css';

export default function ViRootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
