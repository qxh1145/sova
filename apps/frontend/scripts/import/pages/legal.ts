import { HTMLElement, type Node } from 'node-html-parser';
import type { AssetRegistry } from '../assets.ts';
import type { LegalPage, PaymentGuideContent } from '../../../src/types/content.ts';
import { sanitize, type Stats } from '../html.ts';
import { trimBreaks } from '../services.ts';
import {
  bannerTitle,
  count,
  DEMO_ACCOUNT,
  hooks,
  identity,
  must,
  PAYMENT_LABELS,
  rich,
  RICH_ALLOWED,
  seoOf,
  type Page,
} from './shared.ts';

export function legal(
  page: Page,
  registry: AssetRegistry,
  stats: Stats,
  translationKey: string,
): LegalPage {
  const { root, file, lineOf, route } = page;
  const banner = must(root.querySelector('#content > .banner'), page, 'banner');
  const siblings = banner.parentNode!.childNodes;
  const body = siblings.slice(siblings.indexOf(banner) + 1);
  const first = must(
    body.find((n) => n instanceof HTMLElement),
    page,
    'body',
  ) as HTMLElement;
  const line = lineOf(first.range[0]);
  const seo = seoOf(page, registry, stats);
  return {
    ...identity(
      page,
      `legal-${route.path.split('/').at(-2)}`,
      seo,
      lineOf(banner.range[0]),
      bannerTitle(page, stats),
    ),
    translationKey,
    body: rich(trimBreaks(sanitize(body, hooks(page, line, stats), RICH_ALLOWED)), [
      { file, line },
    ]),
    seo,
  };
}

export function payment(
  page: Page,
  registry: AssetRegistry,
  stats: Stats,
  translationKey: string,
): PaymentGuideContent {
  const { root, file, lineOf, route } = page;
  const inner = must(
    root.querySelector('#content > .row > .col > .col-inner'),
    page,
    'guide column',
  );
  const accountRows = must(inner.querySelectorAll('.row-collapse.align-middle'), page, 'accounts');
  const children = inner.childNodes;
  const split = children.findIndex(
    (n) => n instanceof HTMLElement && n.querySelector('.row-collapse.align-middle'),
  );
  const walletIndex = children.findIndex(
    (n, i) => i > split && n instanceof HTMLElement && n.classList.contains('row'),
  );
  const walletRow = must(children[walletIndex] as HTMLElement | undefined, page, 'e-wallet row');
  // Heading col, QR image col, steps col; the MoMo QR image is not imported (Q1).
  const [walletIntro, walletQr, walletSteps] = count(
    walletRow.childNodes.filter(
      (n): n is HTMLElement => n instanceof HTMLElement && n.classList.contains('col'),
    ),
    3,
    page,
    'e-wallet cols',
  );
  must(walletQr.querySelector('img'), page, 'e-wallet QR image');
  // Real accounts and QR images are not imported (Q1): drop each account card.
  for (const row of accountRows) row.parentNode?.closest('.col')?.remove();
  const introLine = lineOf(inner.range[0]);
  const restLine = lineOf((children[split] as HTMLElement).range[0]);
  const walletLine = lineOf(walletRow.range[0]);
  const html = (nodes: Node[], line: number) =>
    trimBreaks(sanitize(nodes, hooks(page, line, stats), RICH_ALLOWED));
  const seo = seoOf(page, registry, stats);
  const id = `legal-${route.path.split('/').at(-2)}`;
  return {
    ...identity(page, id, seo, introLine, bannerTitle(page, stats)),
    translationKey,
    labels: PAYMENT_LABELS[route.locale],
    introduction: rich(html(children.slice(0, split), introLine), [{ file, line: introLine }]),
    seo,
    accounts: accountRows.map((_, i) => ({
      id: `${id}-account-${i + 1}`,
      ...DEMO_ACCOUNT[route.locale],
    })),
    instructions: rich(html(children.slice(split, walletIndex), restLine), [
      { file, line: restLine },
    ]),
    wallet: {
      intro: rich(html([walletIntro], walletLine), [{ file, line: walletLine }]),
      steps: rich(html([walletSteps], walletLine), [{ file, line: walletLine }]),
    },
  };
}
