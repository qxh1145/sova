'use client';

import { HomeError } from '@/components/home/HomeError';

export default function EnHomeError({ reset }: { reset: () => void }) {
  return <HomeError locale="en" reset={reset} />;
}
