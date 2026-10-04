import type { ReactNode } from 'react';
import '@/styles/globals.css';
import { RootDocument } from '@/components/layout/RootDocument';

export default function FixturesLayout({ children }: { children: ReactNode }) {
  return <RootDocument locale="vi">{children}</RootDocument>;
}
