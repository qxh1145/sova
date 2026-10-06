import { notFound } from 'next/navigation';
import { isOverlayVariant } from './constants';
import { OverlayFixture } from './OverlayFixture';

export const dynamic = 'force-dynamic';

export default async function FixtureOverlayPage({
  params,
}: {
  params: Promise<{ variant: string }>;
}) {
  if (process.env.FIXTURE_HARNESS !== '1') {
    notFound();
  }

  const { variant } = await params;
  if (!isOverlayVariant(variant)) {
    notFound();
  }

  return <OverlayFixture variant={variant} />;
}
