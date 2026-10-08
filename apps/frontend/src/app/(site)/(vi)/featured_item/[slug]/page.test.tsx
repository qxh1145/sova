import { expect, test } from 'vitest';
import { projects } from '@/data/projects';
import { generateStaticParams } from './page';

test('generateStaticParams prerenders all 62 project detail slugs', async () => {
  const params = await generateStaticParams();
  expect(params.map((p) => p.slug).sort()).toEqual(projects.map((p) => p.slug).sort());
});
