import { afterEach, describe, expect, it, vi } from 'vitest';
import FixtureCarouselPage from './page';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

describe('FixtureCarouselPage', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('invokes notFound() when FIXTURE_HARNESS is not "1"', async () => {
    const { notFound } = await import('next/navigation');

    vi.stubEnv('FIXTURE_HARNESS', undefined);
    await expect(
      FixtureCarouselPage({ params: Promise.resolve({ variant: 'testimonials' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();

    vi.clearAllMocks();
    vi.stubEnv('FIXTURE_HARNESS', '0');
    await expect(
      FixtureCarouselPage({ params: Promise.resolve({ variant: 'testimonials' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });

  it('invokes notFound() on unknown variant even when FIXTURE_HARNESS is "1"', async () => {
    const { notFound } = await import('next/navigation');

    vi.stubEnv('FIXTURE_HARNESS', '1');
    await expect(
      FixtureCarouselPage({ params: Promise.resolve({ variant: 'nope' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });

  it('renders successfully for testimonials when FIXTURE_HARNESS is "1"', async () => {
    vi.stubEnv('FIXTURE_HARNESS', '1');
    const result = await FixtureCarouselPage({
      params: Promise.resolve({ variant: 'testimonials' }),
    });
    expect(result).toBeDefined();
  });

  it('renders successfully for thp-gallery when FIXTURE_HARNESS is "1"', async () => {
    vi.stubEnv('FIXTURE_HARNESS', '1');
    const result = await FixtureCarouselPage({
      params: Promise.resolve({ variant: 'thp-gallery' }),
    });
    expect(result).toBeDefined();
  });

  it('renders successfully for pricing-mobile when FIXTURE_HARNESS is "1"', async () => {
    vi.stubEnv('FIXTURE_HARNESS', '1');
    const result = await FixtureCarouselPage({
      params: Promise.resolve({ variant: 'pricing-mobile' }),
    });
    expect(result).toBeDefined();
  });
});
