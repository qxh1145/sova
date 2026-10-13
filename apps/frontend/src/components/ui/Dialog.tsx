'use client';

import { useEffect, useState, type ReactNode } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { visuallyHiddenStyle } from './visuallyHidden';

export interface DialogLabels {
  close: string;
}

export interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: 'off-canvas' | 'lightbox';
  holder?: 'inline' | 'image';
  side?: 'left' | 'right';
  id?: string;
  className?: string;
  title: ReactNode;
  titleHidden?: boolean;
  description?: ReactNode;
  labels: DialogLabels;
  onCloseAutoFocus?: (event: Event) => void;
  children: ReactNode;
}

function DialogPortalInner({
  variant,
  closing,
  onTransitionEnd,
  holder = 'inline',
  side = 'right',
  id,
  className = '',
  title,
  titleHidden = false,
  description,
  labels,
  onCloseAutoFocus,
  children,
}: Omit<DialogProps, 'open' | 'onOpenChange'> & { closing: boolean; onTransitionEnd: () => void }) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const handle = requestAnimationFrame(() => {
      setIsReady(true);
    });
    return () => {
      cancelAnimationFrame(handle);
    };
  }, []);

  const variantClass = variant === 'off-canvas' ? `off-canvas off-canvas-${side}` : undefined;
  const readyClass = isReady ? 'mfp-ready' : undefined;

  const overlayClasses = ['mfp-bg', variantClass, readyClass, closing && 'mfp-removing'].filter(Boolean).join(' ');
  const wrapClasses = ['mfp-wrap', 'mfp-close-btn-in', 'mfp-auto-cursor', variantClass, readyClass, closing && 'mfp-removing'].filter(Boolean).join(' ');
  const contentClasses = [
    'mfp-content',
    variant === 'lightbox' ? 'lightbox-content' : undefined,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <DialogPrimitive.Overlay asChild forceMount>
      <div style={{ display: 'contents' }}>
        <div className={overlayClasses} />
        <div className={wrapClasses} style={{ pointerEvents: 'auto', overflowY: 'auto' }}>
          <div className={`mfp-container mfp-s-ready mfp-${holder}-holder`}>
            <DialogPrimitive.Content
              forceMount
              onTransitionEnd={(event) => {
                if (event.target === event.currentTarget && event.propertyName === 'opacity' && closing) onTransitionEnd();
              }}
              id={id}
              className={contentClasses}
              onCloseAutoFocus={onCloseAutoFocus}
            >
              <DialogPrimitive.Title style={titleHidden ? visuallyHiddenStyle : undefined}>
                {title}
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description>{description}</DialogPrimitive.Description>
              ) : null}
              <DialogPrimitive.Close asChild>
                <button
                  type="button"
                  className="mfp-close"
                  aria-label={labels.close}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="feather feather-x"
                    aria-hidden="true"
                    focusable="false"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </DialogPrimitive.Close>
              {children}
            </DialogPrimitive.Content>
          </div>
        </div>
      </div>
    </DialogPrimitive.Overlay>
  );
}

// Reduced motion unmounts at once: never enter the `mfp-removing` phase.
const animateClose = () => !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function Dialog({
  open,
  onOpenChange,
  ...rest
}: DialogProps) {
  const [closing, setClosing] = useState(false);
  const [previousOpen, setPreviousOpen] = useState(open);

  if (open !== previousOpen) {
    setPreviousOpen(open);
    setClosing(!open && animateClose());
  }

  useEffect(() => {
    if (open || !closing) return;
    const timeout = window.setTimeout(() => setClosing(false), 300);
    return () => window.clearTimeout(timeout);
  }, [open, closing]);

  return (
    <DialogPrimitive.Root
      open={open || closing}
      onOpenChange={(nextOpen) => {
        if (nextOpen) setClosing(false);
        if (!nextOpen && open) setClosing(animateClose());
        onOpenChange(nextOpen);
      }}
    >
      {(open || closing) && (
        <DialogPrimitive.Portal forceMount>
          <DialogPortalInner
            {...rest}
            closing={!open && closing}
            onTransitionEnd={() => setClosing(false)}
          />
        </DialogPrimitive.Portal>
      )}
    </DialogPrimitive.Root>
  );
}
