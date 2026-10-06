import { afterEach, describe, expect, it, vi } from 'vitest';
import FixturePrimitivesPage from './page';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

describe('FixturePrimitivesPage', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('invokes notFound() when FIXTURE_HARNESS is not "1"', async () => {
    const { notFound } = await import('next/navigation');

    vi.stubEnv('FIXTURE_HARNESS', undefined);
    await expect(
      FixturePrimitivesPage({ params: Promise.resolve({ variant: 'tabs' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();

    vi.clearAllMocks();
    vi.stubEnv('FIXTURE_HARNESS', '0');
    await expect(
      FixturePrimitivesPage({ params: Promise.resolve({ variant: 'tabs' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });

  it('invokes notFound() on unknown variant even when FIXTURE_HARNESS is "1"', async () => {
    const { notFound } = await import('next/navigation');

    vi.stubEnv('FIXTURE_HARNESS', '1');
    await expect(
      FixturePrimitivesPage({ params: Promise.resolve({ variant: 'unknown' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });

  it('renders successfully for tabs when FIXTURE_HARNESS is "1"', async () => {
    vi.stubEnv('FIXTURE_HARNESS', '1');
    const result = await FixturePrimitivesPage({
      params: Promise.resolve({ variant: 'tabs' }),
    });
    expect(result).toBeDefined();
    expect(result.type).toBe('main');
  });

  it('renders successfully for pagination when FIXTURE_HARNESS is "1"', async () => {
    vi.stubEnv('FIXTURE_HARNESS', '1');
    const result = await FixturePrimitivesPage({
      params: Promise.resolve({ variant: 'pagination' }),
    });
    expect(result).toBeDefined();
    expect(result.type).toBe('main');
  });

  it('renders successfully with ?locale=en for tabs and pagination', async () => {
    vi.stubEnv('FIXTURE_HARNESS', '1');
    const tabsResult = await FixturePrimitivesPage({
      params: Promise.resolve({ variant: 'tabs' }),
      searchParams: Promise.resolve({ locale: 'en' }),
    });
    expect(tabsResult).toBeDefined();
    expect(tabsResult.type).toBe('main');

    const paginationResult = await FixturePrimitivesPage({
      params: Promise.resolve({ variant: 'pagination' }),
      searchParams: Promise.resolve({ locale: 'en', page: '2' }),
    });
    expect(paginationResult).toBeDefined();
    expect(paginationResult.type).toBe('main');
  });
});
