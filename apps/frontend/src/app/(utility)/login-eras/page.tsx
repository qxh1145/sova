// Source order: Bootstrap first, then the ported route stylesheet.
import './bootstrap-subset.css';
import '@/styles/legacy/sections/route-login-eras.css'; // business-text-ok: route CSS import
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getUtilityContent } from '@/lib/queries/pages';
import { getSiteSettings, getShellContent, seoMetadata } from '@/lib/queries/site';
import { LoginView } from '@/components/utility/LoginView';

export async function generateMetadata(): Promise<Metadata> {
  const record = await getUtilityContent('login-vi');
  if (!record?.seo) return {};
  return seoMetadata(record.seo);
}

export default async function LoginPage() {
  const [record, settings, shell] = await Promise.all([
    getUtilityContent('login-vi'),
    getSiteSettings('vi'),
    getShellContent('vi'),
  ]);

  if (!record || !record.login) {
    notFound();
  }

  return (
    <LoginView
      content={{ ...record, login: record.login }}
      wordmark={settings.wordmark}
      demoNotice={shell.consult.demoBadge}
    />
  );
}
