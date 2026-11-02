// Shared by ScrollReveal and the CAP-16 e2e suite. Plain module: no 'use client', no CSS import.
// A `.section` that wraps the GSAP pin (service views) is excluded: any ancestor transform/filter shifts the pin.
export const REVEAL_TARGET_SELECTOR = [
  ':is(main, [role="main"], .portfolio-page-wrapper) .section:not(.section .section, .horizontal-scroll-section, .horizontal-scroll-section *, :has(.horizontal-scroll-section))',
  ':is(main, [role="main"], .portfolio-page-wrapper) :is(h2, h3):not(.horizontal-scroll-section, :is(.section, .banner, .horizontal-scroll-section) *)',
].join(', ');
