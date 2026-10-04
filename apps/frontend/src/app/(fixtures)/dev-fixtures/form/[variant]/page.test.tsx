import { afterEach, describe, expect, it, vi } from 'vitest';
import FixtureFormPage from './page';

vi.mock('next/navigation', () => ({
  notFound: vi.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

describe('FixtureFormPage', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.clearAllMocks();
  });

  it('invokes notFound() when FIXTURE_HARNESS is not "1"', async () => {
    const { notFound } = await import('next/navigation');

    vi.stubEnv('FIXTURE_HARNESS', undefined);
    await expect(
      FixtureFormPage({ params: Promise.resolve({ variant: 'success' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();

    vi.clearAllMocks();
    vi.stubEnv('FIXTURE_HARNESS', '0');
    await expect(
      FixtureFormPage({ params: Promise.resolve({ variant: 'success' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });

  it('invokes notFound() on unknown variant even when FIXTURE_HARNESS is "1"', async () => {
    const { notFound } = await import('next/navigation');

    vi.stubEnv('FIXTURE_HARNESS', '1');
    await expect(
      FixtureFormPage({ params: Promise.resolve({ variant: 'unknown' }) }),
    ).rejects.toThrow('NEXT_NOT_FOUND');
    expect(notFound).toHaveBeenCalled();
  });

  it('renders successfully for success variant when FIXTURE_HARNESS is "1"', async () => {
    vi.stubEnv('FIXTURE_HARNESS', '1');
    const result = await FixtureFormPage({
      params: Promise.resolve({ variant: 'success' }),
    });
    expect(result.props.variant).toBe('success');
  });

  it('renders successfully for error variant when FIXTURE_HARNESS is "1"', async () => {
    vi.stubEnv('FIXTURE_HARNESS', '1');
    const result = await FixtureFormPage({
      params: Promise.resolve({ variant: 'error' }),
    });
    expect(result.props.variant).toBe('error');
  });
});
