import { afterEach, describe, expect, it, vi } from 'vitest';
import FixtureOverlayPage from './page';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

describe('FixtureOverlayPage', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('invokes notFound() when FIXTURE_HARNESS is not "1"', async () => {
    const { notFound } = await import('next/navigation');

    vi.stubEnv('FIXTURE_HARNESS', undefined);
    await expect(
      FixtureOverlayPage({ params: Promise.resolve({ variant: 'menu-consult' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();

    vi.clearAllMocks();
    vi.stubEnv('FIXTURE_HARNESS', '0');
    await expect(
      FixtureOverlayPage({ params: Promise.resolve({ variant: 'menu-consult' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });

  it('invokes notFound() on unknown variant even when FIXTURE_HARNESS is "1"', async () => {
    const { notFound } = await import('next/navigation');

    vi.stubEnv('FIXTURE_HARNESS', '1');
    await expect(
      FixtureOverlayPage({ params: Promise.resolve({ variant: 'unknown' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });

  it('renders successfully for menu-consult when FIXTURE_HARNESS is "1"', async () => {
    vi.stubEnv('FIXTURE_HARNESS', '1');
    const result = await FixtureOverlayPage({
      params: Promise.resolve({ variant: 'menu-consult' }),
    });
    expect(result).toBeDefined();
  });

  it('renders successfully for single when FIXTURE_HARNESS is "1"', async () => {
    vi.stubEnv('FIXTURE_HARNESS', '1');
    const result = await FixtureOverlayPage({
      params: Promise.resolve({ variant: 'single' }),
    });
    expect(result).toBeDefined();
  });
});
