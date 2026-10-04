import { afterEach, describe, expect, it, vi } from 'vitest';
import FixtureShellPage from './page';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

describe('FixtureShellPage', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('invokes notFound() when FIXTURE_HARNESS is not "1"', async () => {
    const { notFound } = await import('next/navigation');

    vi.stubEnv('FIXTURE_HARNESS', undefined);
    await expect(
      FixtureShellPage({ params: Promise.resolve({ variant: 'default' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();

    vi.clearAllMocks();
    vi.stubEnv('FIXTURE_HARNESS', '0');
    await expect(
      FixtureShellPage({ params: Promise.resolve({ variant: 'default' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });

  it('invokes notFound() on unknown variant even when FIXTURE_HARNESS is "1"', async () => {
    const { notFound } = await import('next/navigation');

    vi.stubEnv('FIXTURE_HARNESS', '1');
    await expect(
      FixtureShellPage({ params: Promise.resolve({ variant: 'unknown' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });

  it('renders successfully when FIXTURE_HARNESS is "1" and variant is valid', async () => {
    vi.stubEnv('FIXTURE_HARNESS', '1');
    const result = await FixtureShellPage({
      params: Promise.resolve({ variant: 'default' }),
    });
    expect(result).toBeDefined();
  });
});
