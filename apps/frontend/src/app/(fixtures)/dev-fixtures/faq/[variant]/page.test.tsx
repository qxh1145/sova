import { afterEach, describe, expect, it, vi } from 'vitest';
import FixtureFAQPage from './page';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

describe('FixtureFAQPage', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('invokes notFound() when FIXTURE_HARNESS is not "1"', async () => {
    const { notFound } = await import('next/navigation');

    vi.stubEnv('FIXTURE_HARNESS', undefined);
    await expect(
      FixtureFAQPage({ params: Promise.resolve({ variant: 'default' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();

    vi.clearAllMocks();
    vi.stubEnv('FIXTURE_HARNESS', '0');
    await expect(
      FixtureFAQPage({ params: Promise.resolve({ variant: 'default' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });

  it('invokes notFound() on unknown variant even when FIXTURE_HARNESS is "1"', async () => {
    const { notFound } = await import('next/navigation');

    vi.stubEnv('FIXTURE_HARNESS', '1');
    await expect(
      FixtureFAQPage({ params: Promise.resolve({ variant: 'unknown' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });

  it('renders successfully for default when FIXTURE_HARNESS is "1"', async () => {
    vi.stubEnv('FIXTURE_HARNESS', '1');
    const result = await FixtureFAQPage({
      params: Promise.resolve({ variant: 'default' }),
    });
    expect(result).toBeDefined();
    expect(result.type).toBe('main');
  });

  it('renders successfully for changed when FIXTURE_HARNESS is "1"', async () => {
    vi.stubEnv('FIXTURE_HARNESS', '1');
    const result = await FixtureFAQPage({
      params: Promise.resolve({ variant: 'changed' }),
    });
    expect(result).toBeDefined();
    expect(result.type).toBe('main');
  });

  it('renders successfully with ?locale=en', async () => {
    vi.stubEnv('FIXTURE_HARNESS', '1');
    const result = await FixtureFAQPage({
      params: Promise.resolve({ variant: 'default' }),
      searchParams: Promise.resolve({ locale: 'en' }),
    });
    expect(result).toBeDefined();
    expect(result.type).toBe('main');
  });
});
