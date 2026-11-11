import { PageNotFound } from '@/components/layout/PageNotFound';
import { notFoundCopy } from '@/data/errors';

export default function ViNotFound() {
  return <PageNotFound copy={notFoundCopy.vi} homeHref="/" />;
}
