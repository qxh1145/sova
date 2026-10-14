import { notFound } from 'next/navigation';
import { ContactForm } from '@/components/forms/ContactForm';
import { getContactPage } from '@/lib/queries/pages';
import { getShellContent } from '@/lib/queries/site';
import type { Locale } from '@/types/content';
import { ContactFormScenario } from './ContactFormScenario';

export const dynamic = 'force-dynamic';

export default async function FixtureContactFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ variant: string }>;
  searchParams: Promise<{ locale?: string }>;
}) {
  if (process.env.FIXTURE_HARNESS !== '1') {
    notFound();
  }

  const { variant } = await params;
  if (variant !== 'success' && variant !== 'error') {
    notFound();
  }

  const resolvedSearchParams = await searchParams;
  const locale: Locale = resolvedSearchParams.locale === 'en' ? 'en' : 'vi';

  const [page, shell] = await Promise.all([getContactPage(locale), getShellContent(locale)]);

  if (!page || !page.form) {
    notFound();
  }

  return (
    <div style={{ padding: 40, maxWidth: 600 }}>
      <ContactFormScenario scenario={variant}>
        <ContactForm form={page.form} consult={shell.consult} locale={locale} />
      </ContactFormScenario>
    </div>
  );
}
