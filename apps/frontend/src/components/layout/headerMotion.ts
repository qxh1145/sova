/**
 * Sticky-jump threshold calculation matching Flatsome's header sticky rules:
 * - Stuck when scrollY > wrapperHeight + 100
 * - Unstuck when scrollY < 1
 * - Hysteresis band between 1 and threshold preserves current stuck state
 */
export function nextStuck(
  scrollY: number,
  wrapperHeight: number,
  stuck: boolean,
): boolean {
  if (stuck) {
    return scrollY >= 1;
  }
  return scrollY > wrapperHeight + 100;
}

export { HeaderMotion, type HeaderMotionProps } from './HeaderMotion.tsx';
