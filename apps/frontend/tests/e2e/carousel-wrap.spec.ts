import { expect, test } from './fixtures';

interface SliderTarget {
  name: string;
  path: string;
  selector: string;
  /** Source slide count; a lost or duplicated slide fails the guard. */
  slides: number;
}

const LOOP_SLIDERS: SliderTarget[] = [
  {
    name: 'mobile app (slide_tkap)',
    path: '/thiet-ke-app-mobile/',
    selector: '.slide_tkap',
    slides: 3,
  },
  {
    name: 'storage solution (slide_gplt)',
    path: '/giai-phap-luu-tru/',
    selector: '.slide_gplt',
    slides: 3,
  },
  {
    name: 'seo vi (slide_seo)',
    path: '/seo-tu-khoa-website/',
    selector: '.slide_seo',
    slides: 4,
  },
  {
    name: 'seo en (slide_seo)',
    path: '/en/website-keyword-seo/',
    selector: '.slide_seo',
    slides: 4,
  },
  {
    name: 'branding vi (slide_ui)',
    path: '/ui-ux-branding-design/',
    selector: '.slide_ui',
    slides: 4,
  },
  {
    name: 'branding en (slide_ui)',
    path: '/en/ui-ux-branding-design/',
    selector: '.slide_ui',
    slides: 4,
  },
  {
    name: 'website services (slide_tsao)',
    path: '/thiet-ke-website/',
    selector: '.slide_tsao',
    slides: 3,
  },
  {
    name: 'pricing cards (slide_tke1)',
    path: '/thiet-ke-website/',
    selector: '.slide_tke1',
    slides: 3,
  },
  {
    name: 'about vi goals (slide_gth #slider-512312949)',
    path: '/gioi-thieu/',
    selector: '#slider-512312949',
    slides: 6,
  },
  {
    name: 'about vi pillars (slide_gthieu #slider-1249079120)',
    path: '/gioi-thieu/',
    selector: '#slider-1249079120',
    slides: 3,
  },
  {
    name: 'about en goals (slide_gth #slider-1289423272)',
    path: '/en/about-us/',
    selector: '#slider-1289423272',
    slides: 6,
  },
  {
    name: 'about en pillars (slide_gthieu #slider-1065485534)',
    path: '/en/about-us/',
    selector: '#slider-1065485534',
    slides: 3,
  },
];

const VIEWPORT_WIDTHS = [390, 549];

test.describe('Top-level carousel loop-wrap guards (retro H2/H4)', () => {
  for (const width of VIEWPORT_WIDTHS) {
    for (const sliderConfig of LOOP_SLIDERS) {
      test(`${sliderConfig.name} on ${sliderConfig.path} wraps at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(sliderConfig.path);

        const slider = page.locator(sliderConfig.selector);
        await expect(
          slider,
          `Slider ${sliderConfig.selector} on ${sliderConfig.path} should be visible at ${width}px`,
        ).toBeVisible();

        // Hydration wait: flickity-slider has translate style
        const track = slider.locator('.flickity-slider');
        await expect(track).toHaveAttribute('style', /translate/);

        const prevBtn = slider.locator('.flickity-prev-next-button.previous');
        const nextBtn = slider.locator('.flickity-prev-next-button.next');
        const slides = slider.locator('.flickity-slider > .row, .flickity-slider > .col');
        const slideCount = await slides.count();
        expect(
          slideCount,
          `Slide count on ${sliderConfig.path} (${sliderConfig.selector}) at ${width}px`,
        ).toBe(sliderConfig.slides);

        // Arrows stay attached and enabled in DOM (may have display:none on mobile per Flatsome CSS)
        await expect(prevBtn).toBeAttached();
        await expect(nextBtn).toBeAttached();
        await expect(prevBtn).toBeEnabled();
        await expect(nextBtn).toBeEnabled();

        // Slide 0 is selected initially
        await expect(slides.nth(0)).toHaveClass(/is-selected/);

        // Prev on slide 0 wraps to last slide
        await prevBtn.dispatchEvent('click');
        await expect(slides.nth(slideCount - 1)).toHaveClass(/is-selected/);
        await expect(prevBtn).toBeEnabled();
        await expect(nextBtn).toBeEnabled();

        // Next on last slide wraps back to slide 0
        await nextBtn.dispatchEvent('click');
        await expect(slides.nth(0)).toHaveClass(/is-selected/);
        await expect(prevBtn).toBeEnabled();
        await expect(nextBtn).toBeEnabled();
      });
    }
  }
});
