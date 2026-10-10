import { notFound } from 'next/navigation';
import { WebsiteContactForm } from '@/components/forms/WebsiteContactForm';
import { getService } from '@/lib/queries/services';
import { WebsiteFormScenario } from './WebsiteFormScenario';

export const dynamic = 'force-dynamic';

export default async function FixtureWebsiteFormPage({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  if (process.env.FIXTURE_HARNESS !== '1') {
    notFound();
  }

  const { variant } = await params;
  if (variant !== 'success' && variant !== 'error') {
    notFound();
  }

  const service = await getService('website', 'vi');
  if (!service || !service.contactForm) {
    notFound();
  }

  return (
    <div style={{ padding: 40, maxWidth: 600 }}>
      <WebsiteFormScenario scenario={variant}>
        <WebsiteContactForm labels={service.contactForm} locale="vi" />
      </WebsiteFormScenario>
    </div>
  );
}
