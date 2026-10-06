/* eslint-disable @next/next/no-img-element */
import Link from 'next/link';
import type { ShellContent, SiteSettings } from '@/types/content';
import { CONTACT_ICON_SRC } from './floatingContacts';
import { MobileMenuTrigger } from './MobileMenu';

export interface MobileContactBarProps {
  labels: ShellContent['contactBar'];
  settings: SiteSettings;
  contactHref: string;
}

export function MobileContactBar({ labels, settings, contactHref }: MobileContactBarProps) {
  const primaryPhone = settings.phones?.[0];

  return (
    <section id="azt-contact-footer-outer">
      <div id="azt-contact-footer">
        <MobileMenuTrigger label={labels.menu}>
          <span>
            <img src="/wp-content/uploads/2025/04/menu-bar-1.png" alt={labels.menu} />
            <span className="azt-contact-footer-btn-label">{labels.menu}</span>
          </span>
        </MobileMenuTrigger>

        <Link href={contactHref}>
          <span>
            <img src="/wp-content/uploads/2025/04/contact-1.png" alt={labels.contact} />
            <span className="azt-contact-footer-btn-label">{labels.contact}</span>
          </span>
        </Link>

        {primaryPhone?.href && (
          <a id="azt-contact-footer-btn-center" href={primaryPhone.href}>
            <span className="azt-contact-footer-btn-center-icon">
              <span className="phone-vr-circle-fill" />
              <img src={CONTACT_ICON_SRC.call} alt={labels.call} />
            </span>
            <span>
              <span className="azt-contact-footer-btn-label">
                <span>{labels.call}</span>
              </span>
            </span>
          </a>
        )}

        {settings.messengerHref && (
          <a href={settings.messengerHref} target="_blank" rel="noopener noreferrer">
            <span>
              <img src={CONTACT_ICON_SRC.messenger} alt={labels.messenger} />
              <span className="azt-contact-footer-btn-label">{labels.messenger}</span>
            </span>
          </a>
        )}

        {settings.zaloHref && (
          <a href={settings.zaloHref} target="_blank" rel="noopener noreferrer">
            <span>
              <img
                src={CONTACT_ICON_SRC.zalo}
                alt={labels.zalo}
                className="zalo-icon"
              />
              <span className="azt-contact-footer-btn-label">{labels.zalo}</span>
            </span>
          </a>
        )}
      </div>
    </section>
  );
}
