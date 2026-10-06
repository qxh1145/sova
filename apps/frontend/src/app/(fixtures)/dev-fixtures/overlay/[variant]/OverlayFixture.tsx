'use client';

import Link from 'next/link';
import { Dialog } from '@/components/ui/Dialog';
import {
  ShellOverlayProvider,
  useShellOverlay,
} from '@/components/layout/ShellOverlayProvider';
import {
  FIXTURE_OVERLAY_LABELS,
  type OverlayVariant,
} from './constants';

function OverlayFixtureContent({ variant }: { variant: OverlayVariant }) {
  const { open, handoff, close, isOpen, onCloseAutoFocus } = useShellOverlay();

  return (
    <div>
      <nav>
        <Link
          href={
            variant === 'menu-consult'
              ? '/dev-fixtures/overlay/single'
              : '/dev-fixtures/overlay/menu-consult'
          }
          data-testid="fixture-client-nav"
        >
          {FIXTURE_OVERLAY_LABELS.clientNavLink}
        </Link>
      </nav>

      {variant === 'menu-consult' ? (
        <div>
          <button
            type="button"
            data-testid="menu-trigger"
            onClick={(e) => open('menu', e.currentTarget)}
          >
            {FIXTURE_OVERLAY_LABELS.openMenu}
          </button>

          <Dialog
            open={isOpen('menu')}
            onOpenChange={(openState) => {
              if (!openState) close();
            }}
            variant="off-canvas"
            side="right"
            id="main-menu"
            onCloseAutoFocus={onCloseAutoFocus}
            title={FIXTURE_OVERLAY_LABELS.menuTitle}
            titleHidden
            labels={{ close: FIXTURE_OVERLAY_LABELS.close }}
          >
            <div className="sidebar-menu">
              <ul className="nav nav-sidebar nav-vertical">
                <li>
                  <a href="#link-1" data-testid="menu-link-1">
                    {FIXTURE_OVERLAY_LABELS.menuLink1}
                  </a>
                </li>
                <li>
                  <a href="#link-2" data-testid="menu-link-2">
                    {FIXTURE_OVERLAY_LABELS.menuLink2}
                  </a>
                </li>
                <li>
                  <button
                    type="button"
                    data-testid="menu-consult-trigger"
                    onClick={() => handoff('consult')}
                  >
                    {FIXTURE_OVERLAY_LABELS.consultTrigger}
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    data-testid="menu-consult-direct"
                    onClick={() => open('consult')}
                  >
                    {FIXTURE_OVERLAY_LABELS.openConsultDirect}
                  </button>
                </li>
              </ul>
            </div>
          </Dialog>

          <Dialog
            open={isOpen('consult')}
            onOpenChange={(openState) => {
              if (!openState) close();
            }}
            variant="lightbox"
            id="consult-popup"
            onCloseAutoFocus={onCloseAutoFocus}
            title={FIXTURE_OVERLAY_LABELS.consultTitle}
            titleHidden
            labels={{ close: FIXTURE_OVERLAY_LABELS.close }}
          >
            <div className="lightbox-inner" data-testid="consult-dialog-content">
              <h3>{FIXTURE_OVERLAY_LABELS.consultHeading}</h3>
              <form onSubmit={(e) => e.preventDefault()}>
                <input
                  type="text"
                  data-testid="consult-input-name"
                  placeholder={FIXTURE_OVERLAY_LABELS.inputNamePlaceholder}
                />
                <input
                  type="tel"
                  data-testid="consult-input-phone"
                  placeholder={FIXTURE_OVERLAY_LABELS.inputPhonePlaceholder}
                />
                <button type="submit" data-testid="consult-submit-button">
                  {FIXTURE_OVERLAY_LABELS.submitButton}
                </button>
              </form>
            </div>
          </Dialog>
        </div>
      ) : (
        <div>
          <button
            type="button"
            data-testid="single-trigger"
            onClick={(e) => open('single', e.currentTarget)}
          >
            {FIXTURE_OVERLAY_LABELS.openSingle}
          </button>

          <Dialog
            open={isOpen('single')}
            onOpenChange={(openState) => {
              if (!openState) close();
            }}
            variant="lightbox"
            id="single-dialog"
            onCloseAutoFocus={onCloseAutoFocus}
            title={FIXTURE_OVERLAY_LABELS.singleTitle}
            labels={{ close: FIXTURE_OVERLAY_LABELS.close }}
          >
            <div className="lightbox-inner" data-testid="single-dialog-content">
              <p>{FIXTURE_OVERLAY_LABELS.singleBody}</p>
              <button type="button" data-testid="single-action-button">
                {FIXTURE_OVERLAY_LABELS.singleActionButton}
              </button>
            </div>
          </Dialog>
        </div>
      )}

      <div
        data-testid="scroll-spacer"
        style={{ height: '200vh', marginTop: 32 }}
      >
        <p>{FIXTURE_OVERLAY_LABELS.spacerText}</p>
      </div>
    </div>
  );
}

export function OverlayFixture({ variant }: { variant: OverlayVariant }) {
  return (
    <ShellOverlayProvider>
      <OverlayFixtureContent variant={variant} />
    </ShellOverlayProvider>
  );
}
