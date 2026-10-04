'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export interface ShellOverlayState {
  active: string | null;
  trigger: HTMLElement | null;
}

export type ShellOverlayAction =
  | { type: 'OPEN'; id: string; trigger?: HTMLElement | null }
  | { type: 'HANDOFF'; id: string }
  | { type: 'CLOSE' }
  | { type: 'CLEAR_TRIGGER' };

export function shellOverlayReducer(
  state: ShellOverlayState,
  action: ShellOverlayAction,
): ShellOverlayState {
  switch (action.type) {
    case 'OPEN':
      return {
        active: action.id,
        trigger: state.active === null ? (action.trigger ?? null) : state.trigger,
      };
    case 'HANDOFF':
      return {
        active: action.id,
        trigger: state.trigger,
      };
    case 'CLOSE':
      return {
        active: null,
        trigger: state.trigger,
      };
    case 'CLEAR_TRIGGER':
      return {
        ...state,
        trigger: null,
      };
    default:
      return state;
  }
}

export function isElementVisible(element: HTMLElement): boolean {
  if (!element.isConnected) return false;
  if (typeof element.checkVisibility === 'function') {
    try {
      return element.checkVisibility({ checkVisibilityCSS: true });
    } catch {
      // Fall through to computed style check if checkVisibility throws or options unsupported
    }
  }
  const style = typeof window !== 'undefined' ? window.getComputedStyle(element) : null;
  if (style && (style.display === 'none' || style.visibility === 'hidden')) {
    return false;
  }
  return (
    element.offsetWidth > 0 ||
    element.offsetHeight > 0 ||
    element.getClientRects().length > 0
  );
}

export function restoreFocus(trigger: HTMLElement | null): boolean {
  if (!trigger) return false;
  try {
    if (isElementVisible(trigger)) {
      trigger.focus();
      return true;
    }
  } catch {
    // Left to the browser, with no throw.
  }
  return false;
}

export interface ShellOverlayContextValue {
  active: string | null;
  isOpen: (id: string) => boolean;
  open: (id: string, trigger?: HTMLElement | null) => void;
  handoff: (id: string) => void;
  close: () => void;
  onCloseAutoFocus: (event: Event) => void;
}

const ShellOverlayContext = createContext<ShellOverlayContextValue | null>(null);

export function ShellOverlayProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<string | null>(null);
  const activeRef = useRef<string | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  const open = useCallback((id: string, trigger?: HTMLElement | null) => {
    if (activeRef.current === null) {
      triggerRef.current = trigger ?? null;
    }
    activeRef.current = id;
    setActive(id);
  }, []);

  const handoff = useCallback((id: string) => {
    activeRef.current = id;
    setActive(id);
  }, []);

  const close = useCallback(() => {
    activeRef.current = null;
    setActive(null);
  }, []);

  const isOpen = useCallback((id: string) => active === id, [active]);

  const onCloseAutoFocus = useCallback((event: Event) => {
    if (activeRef.current === null) {
      event.preventDefault();
      const trigger = triggerRef.current;
      triggerRef.current = null;
      restoreFocus(trigger);
    }
  }, []);

  const value = useMemo(
    () => ({
      active,
      isOpen,
      open,
      handoff,
      close,
      onCloseAutoFocus,
    }),
    [active, isOpen, open, handoff, close, onCloseAutoFocus],
  );

  return (
    <ShellOverlayContext.Provider value={value}>
      {children}
    </ShellOverlayContext.Provider>
  );
}

export function useShellOverlay(): ShellOverlayContextValue {
  const context = useContext(ShellOverlayContext);
  if (!context) {
    throw new Error('useShellOverlay must be used within a ShellOverlayProvider');
  }
  return context;
}
