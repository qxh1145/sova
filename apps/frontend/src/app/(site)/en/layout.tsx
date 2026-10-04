import type { ReactNode } from 'react';
import '@/styles/globals.css';
import '@/styles/legacy/en-overrides.css';
import { RootDocument } from '@/components/layout/RootDocument';
import { SiteShell } from '@/components/layout/SiteShell';
import { getShellProps } from '@/lib/queries/site';

export default async function EnRootLayout({ children }: { children: ReactNode }) {
  const shell = await getShellProps('en');

  return (
    <RootDocument locale={shell.locale}>
      <SiteShell {...shell}>{children}</SiteShell>
    </RootDocument>
  );
}
