export const VALID_OVERLAY_VARIANTS = ['menu-consult', 'single'] as const;
export type OverlayVariant = (typeof VALID_OVERLAY_VARIANTS)[number];

export function isOverlayVariant(v: string): v is OverlayVariant {
  return (VALID_OVERLAY_VARIANTS as readonly string[]).includes(v);
}

export const FIXTURE_OVERLAY_LABELS = {
  close: 'Close',
  openMenu: 'Open Menu',
  openSingle: 'Open Lightbox',
  menuTitle: 'Menu',
  menuLink1: 'Home',
  menuLink2: 'About',
  consultTrigger: 'Request Consultation',
  openConsultDirect: 'Direct Open Consult',
  consultTitle: 'Consultation Form',
  consultHeading: 'Get in Touch',
  inputNamePlaceholder: 'Your Name',
  inputPhonePlaceholder: 'Your Phone',
  submitButton: 'Submit',
  singleTitle: 'Single Lightbox',
  singleBody: 'This is a single dialog.',
  singleActionButton: 'Perform Action',
  clientNavLink: 'Client Nav Target',
  spacerText: 'Scroll Spacer Area',
};
