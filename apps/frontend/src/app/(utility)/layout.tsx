import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { RootDocument } from '@/components/layout/RootDocument';
import { getSiteUrl } from '@/lib/site-url';

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
};

export default function UtilityLayout({ children }: { children: ReactNode }) {
  return (
    <RootDocument
      locale="vi"
      bodyClassName="login js login-action-login wp-core-ui locale-vi"
    >
      {children}
    </RootDocument>
  );
}
