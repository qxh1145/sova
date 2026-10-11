import type { ReactNode } from 'react';
import { RootDocument } from '@/components/layout/RootDocument';

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
