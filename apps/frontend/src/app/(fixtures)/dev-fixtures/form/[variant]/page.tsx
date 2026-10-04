import { notFound } from 'next/navigation';
import { isFormVariant } from './constants';
import { FormFixture } from './FormFixture';

export const dynamic = 'force-dynamic';

export default async function FixtureFormPage({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  if (process.env.FIXTURE_HARNESS !== '1') {
    notFound();
  }

  const { variant } = await params;
  if (!isFormVariant(variant)) {
    notFound();
  }

  return <FormFixture variant={variant} />;
}
