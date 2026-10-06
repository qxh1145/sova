'use client';

import { HomeError } from '@/components/home/HomeError';

export default function ViHomeError({ reset }: { reset: () => void }) {
  return <HomeError locale="vi" reset={reset} />;
}
