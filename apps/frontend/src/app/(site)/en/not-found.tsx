import { PageNotFound } from '@/components/layout/PageNotFound';
import { notFoundCopy } from '@/data/errors';

export default function EnNotFound() {
  return <PageNotFound copy={notFoundCopy.en} homeHref="/en/home/" />;
}
