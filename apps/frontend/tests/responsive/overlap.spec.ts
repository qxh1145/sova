import { test, expect, type Page } from '@playwright/test';
import manifest from '../baseline/manifest.json';
import expectedFailures from './expected-failures.json';
import { TESTIMONIALS_IDS } from '@/components/testimonials/testimonialsIds';

const WIDTHS = [
  1440, 1279, 1199, 1024, 992, 850, 849, 768, 640, 575, 550, 549, 480, 414, 390, 360, 320,
];

const testimonialImageWrappers = Array.from(
  new Set(
    Object.values(TESTIMONIALS_IDS).flatMap((locales) => [
      locales.vi.imageWrapper,
      locales.en.imageWrapper,
    ]),
  ),
);

const ALLOWLIST: { pair: RegExp; route?: RegExp; minWidth?: number; reason: string }[] = [
  {
    pair: new RegExp(
      `(?:div#(?:${testimonialImageWrappers.join('|')})\\.img\\.has-hover>div\\.img-inner\\.dark>img\\.attachment-original\\.size-original VS (?:div#text-\\d+\\.text>h4>strong|div#col-\\d+\\.col\\.small-12>div\\.col-inner>div#text-\\d+\\.text\\.nd-kh))|(?:(?:div#text-\\d+\\.text>h4>strong|div#col-\\d+\\.col\\.small-12>div\\.col-inner>div#text-\\d+\\.text\\.nd-kh) VS div#(?:${testimonialImageWrappers.join('|')})\\.img\\.has-hover>div\\.img-inner\\.dark>img\\.attachment-original\\.size-original)`,
    ),
    minWidth: 1280,
    reason:
      'Decorative testimonial image intentionally layers over quote or eyebrow at desktop source parity.',
  },
];
const EXPECTED_FAILURES: Record<string, string[]> = expectedFailures;

async function settle(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addStyleTag({
    content:
      '*,*::before,*::after{transition:none!important;animation-duration:0s!important;animation-delay:0s!important;scroll-behavior:auto!important}',
  });
  await page.evaluate(async () => {
    const w = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    document
      .querySelectorAll<HTMLImageElement>('img[loading="lazy"]')
      .forEach((i) => (i.loading = 'eager'));
    const height = document.documentElement.scrollHeight;
    for (let y = 0; y < height; y += Math.round(innerHeight / 1.5)) {
      scrollTo(0, y);
      await w(50);
    }
    scrollTo(0, 0);
    await w(300);
    const win = window as typeof window & {
      gsap?: {
        globalTimeline: {
          getChildren: (...args: boolean[]) => { progress: (value: number) => void }[];
        };
      };
      ScrollTrigger?: {
        update: () => void;
      };
    };
    win.gsap?.globalTimeline.getChildren(true, true, true).forEach((t) => t.progress(1));
    win.ScrollTrigger?.update();
  });
  if (process.env.RESPONSIVE_INJECT_CSS)
    await page.addStyleTag({ content: process.env.RESPONSIVE_INJECT_CSS });
}

function measure() {
  const vw = innerWidth,
    sx = scrollX,
    sy = scrollY;
  type Clip = { l: number; t: number; r: number; b: number };
  type Box = Clip & { el: Element; kind: string; text: string };
  const fixedCache = new Map<Element, boolean>(),
    clipCache = new Map<Element, Clip>();
  const isFixed = (el: Element | null): boolean => {
    if (!el || el === document.body) return false;
    if (fixedCache.has(el)) return fixedCache.get(el)!;
    const p = getComputedStyle(el).position;
    const v = p === 'fixed' || p === 'sticky' || isFixed(el.parentElement);
    fixedCache.set(el, v);
    return v;
  };
  // visible clip rect from overflow!=visible ancestors
  const clipOf = (el: Element | null): Clip => {
    if (!el || el === document.documentElement) return { l: -1e9, t: -1e9, r: 1e9, b: 1e9 };
    if (clipCache.has(el)) return clipCache.get(el)!;
    const parent = clipOf(el.parentElement);
    const cs = getComputedStyle(el);
    let c = parent;
    if (cs.overflowX !== 'visible' || cs.overflowY !== 'visible') {
      const r = el.getBoundingClientRect();
      c = {
        l: Math.max(parent.l, r.left),
        t: Math.max(parent.t, r.top),
        r: Math.min(parent.r, r.right),
        b: Math.min(parent.b, r.bottom),
      };
    }
    clipCache.set(el, c);
    return c;
  };
  const visible = (el: Element) =>
    el.checkVisibility?.({ opacityProperty: true, visibilityProperty: true }) ?? true;
  const desc = (el: Element) => {
    const parts = [];
    let e: Element | null = el;
    for (let i = 0; e && i < 3 && e !== document.body; i++, e = e.parentElement)
      parts.unshift(
        e.tagName.toLowerCase() +
          (e.id ? '#' + e.id : '') +
          (e.classList.length ? '.' + [...e.classList].slice(0, 2).join('.') : ''),
      );
    return parts.join('>');
  };
  const boxes: Box[] = [];
  const push = (el: Element, r: DOMRect, kind: string, text: string) => {
    const c = clipOf(el.parentElement);
    const l = Math.max(r.left, c.l),
      t = Math.max(r.top, c.t),
      rr = Math.min(r.right, c.r),
      b = Math.min(r.bottom, c.b);
    if (rr - l < 2 || b - t < 2) return;
    boxes.push({ el, kind, text, l: l + sx, t: t + sy, r: rr + sx, b: b + sy });
  };
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = tw.nextNode());) {
    const txt = (n.textContent ?? '').replace(/\s+/g, ' ').trim();
    const el = n.parentElement;
    if (
      txt.length < 2 ||
      !el ||
      el.closest('.screen-reader-text,.sr-only,.visually-hidden') ||
      /^(SCRIPT|STYLE|NOSCRIPT|OPTION)$/.test(el.tagName) ||
      isFixed(el) ||
      !visible(el)
    )
      continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    for (const r of range.getClientRects()) push(el, r, 'text', txt.slice(0, 50));
  }
  for (const el of document.querySelectorAll('img,video,iframe,input,textarea,select,svg')) {
    const bg = (e: Element | null) =>
      e && ['absolute', 'fixed'].includes(getComputedStyle(e).position);
    if (bg(el) || bg(el.parentElement) || el.closest('.fill,.bg,.banner-bg,.section-bg')) continue;
    if (isFixed(el) || !visible(el) || (el.tagName === 'svg' && el.parentElement?.closest('svg')))
      continue;
    push(
      el,
      el.getBoundingClientRect(),
      'media',
      el.getAttribute('alt') || el.getAttribute('placeholder') || el.tagName.toLowerCase(),
    );
  }
  boxes.sort((a, b) => a.t - b.t);
  const hits = [];
  for (let i = 0; i < boxes.length; i++) {
    const a = boxes[i];
    for (let j = i + 1; j < boxes.length && boxes[j].t < a.b; j++) {
      const b = boxes[j];
      if (a.kind === 'media' && b.kind === 'media') continue;
      if (a.el === b.el || a.el.contains(b.el) || b.el.contains(a.el)) continue;
      const w = Math.min(a.r, b.r) - Math.max(a.l, b.l),
        h = Math.min(a.b, b.b) - Math.max(a.t, b.t);
      if (w < 4 || h < 4) continue;
      const small = Math.min((a.r - a.l) * (a.b - a.t), (b.r - b.l) * (b.b - b.t));
      if ((w * h) / small < 0.25) continue;
      hits.push({
        a: a.text,
        b: b.text,
        kinds: a.kind + '/' + b.kind,
        y: Math.round(Math.max(a.t, b.t)),
        x: Math.round(Math.max(a.l, b.l)),
        sa: desc(a.el),
        sb: desc(b.el),
      });
    }
  }
  for (const el of document.body.querySelectorAll('*')) {
    if (isFixed(el) || !visible(el)) continue;
    const r = el.getBoundingClientRect();
    if (r.width < 2 || r.height < 2 || (r.right <= vw + 1 && r.left >= -1)) continue;
    let clipped = false;
    for (
      let ancestor = el.parentElement;
      ancestor && ancestor !== document.documentElement;
      ancestor = ancestor.parentElement
    ) {
      if (ancestor.classList.contains('banner-layers')) continue;
      const overflow = getComputedStyle(ancestor).overflowX;
      if (overflow !== 'visible' && overflow !== 'clip') {
        clipped = true;
        break;
      }
    }
    if (!clipped)
      hits.push({
        sa: `overflow:${desc(el)}`,
        sb: '',
        x: Math.round(r.right),
        y: Math.round(r.top),
      });
  }
  const de = document.documentElement;
  if (de.scrollWidth > vw + 1)
    hits.push({ sa: `overflow:document`, sb: '', x: de.scrollWidth, y: 0 });
  return {
    overflowX: Math.max(0, de.scrollWidth - vw),
    height: de.scrollHeight,
    hits,
    hitCount: hits.length,
  };
}

for (const row of manifest.rows) {
  test(`Responsive ${row.key}`, async ({ page }) => {
    expect(ALLOWLIST.every(({ reason }) => reason.trim().length > 0)).toBe(true);
    const pairs = new Set<string>();
    const details = new Map<string, Set<string>>();
    const seen = new Set<string>();
    async function check(width: number, mode: string) {
      await settle(page);
      const result = await page.evaluate(measure);
      for (const hit of result.hits) {
        const pair = hit.sb ? [hit.sa, hit.sb].sort().join(' VS ') : hit.sa;
        if (
          ALLOWLIST.some(
            (rule) =>
              rule.pair.test(pair) &&
              (!rule.route || rule.route.test(row.key)) &&
              (rule.minWidth === undefined || width >= rule.minWidth),
          )
        )
          continue;
        seen.add(pair);
        if (!details.has(pair)) details.set(pair, new Set());
        details.get(pair)!.add(`${width}/${mode}`);
        if (!EXPECTED_FAILURES[row.key]?.includes(pair))
          pairs.add(`${row.key}, ${width}, ${mode}, ${pair}`);
      }
    }
    const response = await page.goto(row.url, { waitUntil: 'load' });
    expect(response?.ok()).toBe(true);
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      await check(width, 'resize');
    }
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: 900 });
      const response = await page.goto(row.url, { waitUntil: 'load' });
      expect(response?.ok()).toBe(true);
      await check(width, 'fresh');
    }
    const stale = (EXPECTED_FAILURES[row.key] ?? []).filter((pair) => !seen.has(pair));
    if (process.env.RESPONSIVE_COLLECT)
      console.log(
        `RESPONSIVE_PAIRS ${row.key} ${JSON.stringify(Object.fromEntries([...details].map(([pair, widths]) => [pair, [...widths]])))}`,
      );
    expect([...pairs].sort(), `Unexpected hits: ${[...pairs].sort().join('\n')}`).toEqual([]);
    expect(stale, `remove from expected-failures: ${row.key}: ${stale.join(', ')}`).toEqual([]);
  });
}
