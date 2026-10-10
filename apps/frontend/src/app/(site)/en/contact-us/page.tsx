import '@/styles/legacy/sections/route-en--contact-us.css';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getContactPage, getContactAssets } from '@/lib/queries/pages';
import { getShellContent, getSiteSettings } from '@/lib/queries/site';
import { ContactView } from '@/components/contact/ContactView';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getContactPage('en');
  if (!page) return {};
  return {
    title: page.seo.title,
    description: page.seo.description,
  };
}

export default async function ContactUsPage() {
  const page = await getContactPage('en');
  if (!page) {
    notFound();
  }

  const [settings, assets, shell] = await Promise.all([
    getSiteSettings('en'),
    getContactAssets(page),
    getShellContent('en'),
  ]);

  return (
    <ContactView
      page={page}
      settings={settings}
      assets={assets}
      cardLabels={shell.floatingContacts}
    />
  );
}
