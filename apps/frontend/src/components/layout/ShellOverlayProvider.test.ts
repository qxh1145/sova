import { describe, expect, it, vi } from 'vitest';
import {
  isElementVisible,
  restoreFocus,
  shellOverlayReducer,
  type ShellOverlayState,
} from './ShellOverlayProvider';

describe('shellOverlayReducer', () => {
  it('allows only one active overlay at a time', () => {
    const initial: ShellOverlayState = { active: null, trigger: null };
    const mockTriggerA = { isConnected: true } as unknown as HTMLElement;
    const mockTriggerB = { isConnected: true } as unknown as HTMLElement;

    const stateA = shellOverlayReducer(initial, {
      type: 'OPEN',
      id: 'menu',
      trigger: mockTriggerA,
    });
    expect(stateA.active).toBe('menu');
    expect(stateA.trigger).toBe(mockTriggerA);

    // Opening B while A is active replaces active with B
    const stateB = shellOverlayReducer(stateA, {
      type: 'OPEN',
      id: 'consult',
      trigger: mockTriggerB,
    });
    expect(stateB.active).toBe('consult');
    // Does not allow multiple active overlays: active is a single string
    expect(stateB.active).not.toBe('menu');
  });

  it('resets trigger to null when trigger is omitted while active is null', () => {
    const initialWithTrigger: ShellOverlayState = {
      active: null,
      trigger: { isConnected: true } as unknown as HTMLElement,
    };
    const state = shellOverlayReducer(initialWithTrigger, {
      type: 'OPEN',
      id: 'menu',
    });
    expect(state.active).toBe('menu');
    expect(state.trigger).toBeNull();
  });

  it('handoff keeps the original trigger and updates active overlay', () => {
    const mockTrigger = { isConnected: true } as unknown as HTMLElement;
    const initial: ShellOverlayState = { active: null, trigger: null };

    const stateMenu = shellOverlayReducer(initial, {
      type: 'OPEN',
      id: 'menu',
      trigger: mockTrigger,
    });
    expect(stateMenu.active).toBe('menu');
    expect(stateMenu.trigger).toBe(mockTrigger);

    // Handoff to consult
    const stateConsult = shellOverlayReducer(stateMenu, {
      type: 'HANDOFF',
      id: 'consult',
    });
    expect(stateConsult.active).toBe('consult');
    expect(stateConsult.trigger).toBe(mockTrigger);

    // Open while active does not overwrite original trigger
    const mockTrigger2 = { isConnected: true } as unknown as HTMLElement;
    const stateOpenedWhileActive = shellOverlayReducer(stateConsult, {
      type: 'OPEN',
      id: 'other',
      trigger: mockTrigger2,
    });
    expect(stateOpenedWhileActive.active).toBe('other');
    expect(stateOpenedWhileActive.trigger).toBe(mockTrigger);

    // Close keeps trigger for onCloseAutoFocus
    const stateClosed = shellOverlayReducer(stateConsult, { type: 'CLOSE' });
    expect(stateClosed.active).toBeNull();
    expect(stateClosed.trigger).toBe(mockTrigger);

    // Clear trigger
    const stateCleared = shellOverlayReducer(stateClosed, { type: 'CLEAR_TRIGGER' });
    expect(stateCleared.trigger).toBeNull();
  });
});

describe('restoreFocus & isElementVisible', () => {
  it('returns false when trigger is null or undefined', () => {
    expect(restoreFocus(null)).toBe(false);
  });

  it('skips a stale or disconnected trigger without throwing', () => {
    const focusSpy = vi.fn();
    const staleTrigger = {
      isConnected: false,
      focus: focusSpy,
    } as unknown as HTMLElement;

    expect(isElementVisible(staleTrigger)).toBe(false);
    expect(restoreFocus(staleTrigger)).toBe(false);
    expect(focusSpy).not.toHaveBeenCalled();
  });

  it('skips a hidden trigger using checkVisibility with checkVisibilityCSS: true', () => {
    const focusSpy = vi.fn();
    const hiddenTrigger = {
      isConnected: true,
      checkVisibility: (options?: { checkVisibilityCSS?: boolean }) => {
        expect(options?.checkVisibilityCSS).toBe(true);
        return false;
      },
      focus: focusSpy,
    } as unknown as HTMLElement;

    expect(isElementVisible(hiddenTrigger)).toBe(false);
    expect(restoreFocus(hiddenTrigger)).toBe(false);
    expect(focusSpy).not.toHaveBeenCalled();
  });

  it('falls back to computed style/dimensions when checkVisibility throws', () => {
    const focusSpy = vi.fn();
    const fallbackTrigger = {
      isConnected: true,
      checkVisibility: () => {
        throw new Error('Unsupported options');
      },
      offsetWidth: 20,
      offsetHeight: 20,
      getClientRects: () => [{}],
      focus: focusSpy,
    } as unknown as HTMLElement;

    expect(isElementVisible(fallbackTrigger)).toBe(true);
    expect(restoreFocus(fallbackTrigger)).toBe(true);
    expect(focusSpy).toHaveBeenCalledOnce();
  });

  it('focuses a connected and visible trigger', () => {
    const focusSpy = vi.fn();
    const visibleTrigger = {
      isConnected: true,
      checkVisibility: (options?: { checkVisibilityCSS?: boolean }) => {
        expect(options?.checkVisibilityCSS).toBe(true);
        return true;
      },
      focus: focusSpy,
    } as unknown as HTMLElement;

    expect(isElementVisible(visibleTrigger)).toBe(true);
    expect(restoreFocus(visibleTrigger)).toBe(true);
    expect(focusSpy).toHaveBeenCalledOnce();
  });

  it('catches any focus() error without throwing and returns false', () => {
    const throwingTrigger = {
      isConnected: true,
      checkVisibility: () => true,
      focus: () => {
        throw new Error('Focus error');
      },
    } as unknown as HTMLElement;

    expect(() => restoreFocus(throwingTrigger)).not.toThrow();
    expect(restoreFocus(throwingTrigger)).toBe(false);
  });
});
