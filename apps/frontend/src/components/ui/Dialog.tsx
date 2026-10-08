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
}: Omit<DialogProps, 'open' | 'onOpenChange'>) {
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

  const overlayClasses = ['mfp-bg', variantClass, readyClass].filter(Boolean).join(' ');
  const wrapClasses = ['mfp-wrap', 'mfp-close-btn-in', 'mfp-auto-cursor', variantClass, readyClass].filter(Boolean).join(' ');
  const contentClasses = [
    'mfp-content',
    variant === 'lightbox' ? 'lightbox-content' : undefined,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <DialogPrimitive.Overlay asChild>
      <div style={{ display: 'contents' }}>
        <div className={overlayClasses} />
        <div className={wrapClasses} style={{ pointerEvents: 'auto', overflowY: 'auto' }}>
          <div className={`mfp-container mfp-s-ready mfp-${holder}-holder`}>
            <DialogPrimitive.Content
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

export function Dialog({
  open,
  onOpenChange,
  ...rest
}: DialogProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPortalInner {...rest} />
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
