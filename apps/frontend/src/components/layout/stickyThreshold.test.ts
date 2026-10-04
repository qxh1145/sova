import { describe, expect, it } from 'vitest';
import { nextStuck } from './stickyThreshold';

describe('nextStuck', () => {
  const wrapperHeight = 90;
  const threshold = wrapperHeight + 100; // 190

  it('stays unstuck below threshold when currently unstuck', () => {
    expect(nextStuck(0, wrapperHeight, false)).toBe(false);
    expect(nextStuck(50, wrapperHeight, false)).toBe(false);
    expect(nextStuck(100, wrapperHeight, false)).toBe(false);
    expect(nextStuck(threshold, wrapperHeight, false)).toBe(false);
  });

  it('crosses threshold and becomes stuck', () => {
    expect(nextStuck(threshold + 1, wrapperHeight, false)).toBe(true);
    expect(nextStuck(300, wrapperHeight, false)).toBe(true);
    expect(nextStuck(600, wrapperHeight, false)).toBe(true);
  });

  it('preserves stuck state inside hysteresis band (1 <= scrollY <= threshold)', () => {
    // When stuck, scrolling back into the 1..threshold range remains stuck
    expect(nextStuck(threshold, wrapperHeight, true)).toBe(true);
    expect(nextStuck(150, wrapperHeight, true)).toBe(true);
    expect(nextStuck(50, wrapperHeight, true)).toBe(true);
    expect(nextStuck(1, wrapperHeight, true)).toBe(true);
  });

  it('unsticks when scrollY falls below 1', () => {
    expect(nextStuck(0.5, wrapperHeight, true)).toBe(false);
    expect(nextStuck(0, wrapperHeight, true)).toBe(false);
    expect(nextStuck(-10, wrapperHeight, true)).toBe(false);
  });

  it('works with mobile wrapper height (70px)', () => {
    const mobileHeight = 70;
    const mobileThreshold = mobileHeight + 100; // 170

    expect(nextStuck(mobileThreshold, mobileHeight, false)).toBe(false);
    expect(nextStuck(mobileThreshold + 1, mobileHeight, false)).toBe(true);
    expect(nextStuck(50, mobileHeight, true)).toBe(true);
    expect(nextStuck(0, mobileHeight, true)).toBe(false);
  });
});
