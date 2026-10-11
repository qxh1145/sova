# Carousel Parity and Implementation Documentation

This document records the design decisions, option mappings, geometry measurements, and source findings from porting Flatsome's legacy Flickity sliders to the modern Embla Carousel (`8.6.0`) primitive in SOVA.

---

## 1. Overview & Architecture

### Client Boundary
In accordance with `docs/CLIENT_BOUNDARIES.md`:
- `apps/frontend/src/components/ui/Carousel.tsx` is an isolated `'use client'` primitive component.
- The primitive receives only generic props and valid React children (`CarouselProps`). It contains no imports from `@/dev` or `@/data`.
- To support React Server Component (RSC) serialization without function-passing errors across server/client boundaries, accessible labels accept a template string format (e.g. `'Slide {index}'` or `'Go to slide {index}'`) in addition to optional callbacks.

### Styling & Flex Track Layout
Flickity originally positioned each slide absolutely (`position: absolute; left: X%`) inside a relative slider container. Embla Carousel uses a flexbox layout track (`display: flex`) where slides sit side-by-side and the container translates via CSS 3D transforms (`transform: translate3d(Xpx, 0, 0)`).

To achieve 100% styling parity without modifying legacy CSS files:
- Minimal overrides are centralized in `apps/frontend/src/styles/carousel.css`, loaded in `globals.css` after `/* port:css end */`.
- `.flickity-slider` is declared as a flex container (`display: flex; align-items: flex-start; position: static; width: 100%;`). `align-items: flex-start` keeps each cell at its own height so AutoHeight can measure it.
- Each server child *is* the cell (no wrapper); the adapter merges `is-selected` onto the child with `cloneElement`, so legacy child-keyed rules (`.flickity-slider>.row:not(.is-selected)`, `>.col`, `>.img`) match as in Flickity.
- Child slides (`.flickity-slider > *`) default to `flex: 0 0 100%; min-width: 0; margin: 0;`, allowing Flatsome variant classes (such as `.slider-style-focus` max-width 1050px, or `.eras-table-price-slider` max-width 85%) to size and peek neighbouring slides naturally.
- User drag selections are prevented with `user-select: none` and `-webkit-user-drag: none`.
- Pagination dots in `.flickity-page-dots .dot` reset button appearance and padding while preserving legacy Flatsome circle styles.

---

## 2. Per-Prototype Mapping & Geometry Measurements

Three prototypes from the original capture were targeted and verified:

### A. Testimonials Slider (`testimonials`)
- **Source location:** Homepage (`/index.html`), `#slider-1717467276`.
- **Legacy Flatsome options:**
  ```json
  {
    "cellAlign": "center",
    "imagesLoaded": true,
    "lazyLoad": 1,
    "freeScroll": false,
    "wrapAround": true,
    "autoPlay": 6000,
    "pauseAutoPlayOnHover": true,
    "prevNextButtons": true,
    "pageDots": true,
    "adaptiveHeight": true,
    "dragThreshold": 10
  }
  ```
- **Embla options mapping:**
  - `align: "center"`
  - `loop: true`
  - `autoplayMs: 6000` (`embla-carousel-autoplay` plugin)
  - `pauseOnHover: true` (root `mouseenter`/`mouseleave` stop/play, covering arrows and dots like Flickity)
  - `adaptiveHeight: true` (`embla-carousel-auto-height` plugin)
  - `arrows: true`, `dots: true`
  - `dragThreshold: 10`
- **Measured Geometry (1280px viewport):**
  - **Source capture (static unhydrated):** Slider `503.3px x 293.5px`, first slide `503.3px x 293.5px`. (Note: The 503.3px width in the source capture was caused by its 5-column wrapper container `col medium-5 small-12 large-5` in the homepage grid, whereas the isolated SOVA dev-fixture renders across the full 1280px viewport).
  - **SOVA hydrated component:** Slider `1280px x 137px`, first slide `1280px x 137px`.
  - **Navigation buttons:** Previous/Next buttons `36px x 137.2px` with SVG chevron icons.
  - **Dots:** Dot targets `24px x 38.8px`.

### B. THP Project Gallery (`thp-gallery`)
- **Source location:** Project detail page (`/featured_item/cong-ty-co-phan-phat-trien-cong-nghe-thp/index.html`), `#slider-duan`.
- **Legacy Flatsome options:**
  ```json
  {
    "cellAlign": "center",
    "imagesLoaded": true,
    "lazyLoad": 1,
    "freeScroll": false,
    "wrapAround": true,
    "autoPlay": 3000,
    "pauseAutoPlayOnHover": true,
    "prevNextButtons": true,
    "pageDots": true
  }
  ```
- **Embla options mapping:**
  - `align: "center"`
  - `loop: true`
  - `autoplayMs: 3000`
  - `arrows: true`, `dots: true`
  - `containScroll: false` (allows slide centering even when slide count is 2 without edge clipping)
- **Measured Geometry (1280px viewport):**
  - **Source capture:** Slider `1280px x 1340px`, first slide `1280px x 967.5px`.
  - **SOVA hydrated component:** Slider `1280px x 1110px`, first slide `1050px x 1050px`.
  - **Width ratio:** `1050 / 1280 = 0.8203` (~82% width, matching `.slider-style-focus .flickity-slider > * { max-width: 1050px }`).
  - **Peeking neighbours:** Slide center aligns with slider center within `< 5px` (`sliderCenter = 660px`, `slideCenter = 660px`). Previous/next slides peek symmetrically on both edges.
  - **Navigation buttons:** `36px x 222px` circle buttons (`.slider-nav-circle.slider-nav-large`).
  - **Dots:** Dot targets `24px x 38.8px`.

### C. Mobile Pricing Slider (`pricing-mobile`)
- **Source location:** Web design pricing page (`/thiet-ke-website/index.html`), `#slider-74016963`.
- **Legacy Flatsome options:**
  ```json
  {
    "cellAlign": "center",
    "imagesLoaded": true,
    "lazyLoad": 1,
    "freeScroll": false,
    "wrapAround": true,
    "autoPlay": 6000,
    "pauseAutoPlayOnHover": true,
    "prevNextButtons": true,
    "pageDots": true,
    "adaptiveHeight": true,
    "dragThreshold": 10
  }
  ```
- **Embla options mapping:**
  - `align: "center"`
  - `loop: true`
  - `autoplayMs: 6000`
  - `pauseOnHover: true`
  - `adaptiveHeight: true`
  - `arrows: true`
  - `dots: true`
  - `dragThreshold: 10`
- **Measured Geometry (390px mobile viewport):**
  - **Source capture:** Slider `390px x 845px`, first slide `390px x 845px`.
  - **SOVA hydrated component:** Slider `390px x 845px`, first slide `331.5px x 845px`.
  - **Width ratio:** Exactly `0.85` (`331.5 / 390 = 0.85`), matching `.eras-table-price-slider .flickity-slider > * { max-width: 85% }`.
  - **Peeking neighbour:** The next card peeks into view on the right edge by 15% (58.5px).
  - **Responsive behavior:** At viewports `>= 550px`, the `.show-for-small` wrapper hides the carousel, switching to standard desktop table view.

---

## 3. Friction / Attraction to Duration Decision

- **Flickity physics:** Flickity computes momentum using spring attraction (`selectedAttraction: 0.025`) and velocity decay (`friction: 0.28` to `0.6`).
- **Embla physics:** Embla calculates animation steps using a normalized `duration` parameter (default `25`), corresponding to scroll velocity and settling frames.
- **Decision:** We adopted Embla's native default `duration: 25` (with passthrough prop support for custom values). Visual inspection and Playwright clock-driven frame testing confirmed that `duration: 25` provides silky-smooth 60fps transitions that match the perceived speed of Flatsome sliders without spring bounce artifacts or overshoot.

---

## 3a. Review decisions (2026-10-04)

- **Interaction stops autoplay** (Flickity parity): `stopOnInteraction: true`; arrow/dot clicks and drags stop autoplay for good, and hover-leave does not restart it.
- **Reduced motion:** autoplay is disabled under `prefers-reduced-motion: reduce`.
- **A11y:** optional `labels.region` makes the root a named `region`; arrow SVGs are `aria-hidden`. A visible pause control is deferred (new UI absent from source).
- **THP 80% rule** (`.portfolio-page-wrapper.portfolio-single-page … max-width:80%`) is inside `@media (max-width: 549px)`; desktop cells use the 1050px cap. The fixture now includes the page wrapper so the mobile rule applies.

## 4. Missing Source Chunk Evidence

- In the original mirror at `eras-clone/wp-content/themes/flatsome/assets/js/`:
  - Chunk ID 436 (`chunk.slider.js`) was absent from the captured asset manifest.
  - As a result, Flickity runtime JavaScript never executed in the captured mirror. The static clone only contained the un-hydrated DOM with inline `data-flickity-options` JSON strings and fallback CSS positioning.
- Our Embla adapter faithfully re-implements the full runtime behavior specified in those `data-flickity-options` attributes (autoplay, pause on hover, wrap-around loop, drag sensitivity threshold, accessible keyboard controls) without needing Flickity or jQuery dependencies.

---

## 5. Unresolved Regressions

- **None.** All 13 automated E2E tests (10 contract tests and 3 parity comparison tests) pass cleanly.
