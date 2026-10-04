import { describe, expect, it } from 'vitest';
import { getCarouselPlugins, toEmblaOptions } from './Carousel';

describe('toEmblaOptions', () => {
  it('maps options correctly for multi-slide carousel', () => {
    const opts = toEmblaOptions(
      {
        align: 'center',
        loop: true,
        dragThreshold: 10,
        duration: 20,
      },
      3,
    );

    expect(opts).toEqual({
      align: 'center',
      loop: true,
      watchDrag: true,
      dragThreshold: 10,
      duration: 20,
    });
  });

  it('uses default start align and false loop when unspecified', () => {
    const opts = toEmblaOptions({}, 2);
    expect(opts).toEqual({
      align: 'start',
      loop: false,
      watchDrag: true,
    });
  });

  it('forces loop to false and watchDrag to false for single slide', () => {
    const opts = toEmblaOptions(
      {
        align: 'center',
        loop: true,
        dragThreshold: 10,
      },
      1,
    );

    expect(opts.loop).toBe(false);
    expect(opts.watchDrag).toBe(false);
    expect(opts.align).toBe('center');
  });

  it('forces loop to false and watchDrag to false when slideCount is 0', () => {
    const opts = toEmblaOptions({ loop: true }, 0);
    expect(opts.loop).toBe(false);
    expect(opts.watchDrag).toBe(false);
  });

  it('maps containScroll when provided', () => {
    const opts = toEmblaOptions({ containScroll: false }, 2);
    expect(opts.containScroll).toBe(false);
  });
});

describe('getCarouselPlugins', () => {
  it('returns empty array when no plugins are configured', () => {
    const plugins = getCarouselPlugins({}, 3);
    expect(plugins).toEqual([]);
  });

  it('returns empty array for single slide even if autoplay and adaptiveHeight are configured', () => {
    const plugins = getCarouselPlugins(
      {
        autoplayMs: 3000,
        adaptiveHeight: true,
      },
      1,
    );
    expect(plugins).toEqual([]);
  });

  it('creates Autoplay plugin when autoplayMs is positive and slideCount > 1', () => {
    const plugins = getCarouselPlugins({ autoplayMs: 6000 }, 3);
    expect(plugins).toHaveLength(1);
    expect(plugins[0].name).toBe('autoplay');
  });

  it('does not create Autoplay plugin when autoplayMs is 0 or undefined', () => {
    const pluginsNoAutoplay = getCarouselPlugins({ autoplayMs: 0 }, 3);
    expect(pluginsNoAutoplay).toEqual([]);

    const pluginsUndefined = getCarouselPlugins({}, 3);
    expect(pluginsUndefined).toEqual([]);
  });

  it('creates AutoHeight plugin when adaptiveHeight is true and slideCount > 1', () => {
    const plugins = getCarouselPlugins({ adaptiveHeight: true }, 3);
    expect(plugins).toHaveLength(1);
    expect(plugins[0].name).toBe('autoHeight');
  });

  it('creates both plugins when both autoplay and adaptiveHeight are configured', () => {
    const plugins = getCarouselPlugins(
      {
        autoplayMs: 5000,
        adaptiveHeight: true,
      },
      4,
    );
    expect(plugins).toHaveLength(2);
    const names = plugins.map((p) => p.name);
    expect(names).toContain('autoplay');
    expect(names).toContain('autoHeight');
  });
});
