import { HTMLElement } from 'node-html-parser';
import type { Locale, Navigation, NavigationItem, RouteEntry } from '../../src/types/content.ts';
import { resolvePath } from '../../src/lib/routes.ts';
import { processHref, processText, type Stats } from './html.ts';
import { slug } from './faq.ts';
import { load } from './projects.ts';

/** ROUTE_MAP excluded families: menu links to them are dropped (logged), never resolved. */
const EXCLUDED =
  /^\/(?:en\/)?(?:tuyen-dung|giai-phap-truyen-thong-so|digital-communications-solutions)\//;
const HEADER_LINKS = 12;
const SERVICE_OPTIONS = 6;
const FOOTER_GROUPS = ['about', 'service', 'quick-links'];
/** Contact-form options that are not a service page. */
const NOT_A_SERVICE = /^(?:Tuyển Dụng|Recruitment)$/i;

export interface NavCtx {
  file: string;
  locale: Locale;
  lineOf: (offset: number) => number;
  routes: RouteEntry[];
  stats: Stats;
  /** `file:line href` of every dropped link. */
  dropped: string[];
}

const label = (el: HTMLElement, stats: Stats) =>
  processText(el.text, stats).replace(/\s+/g, ' ').trim();

const child = (el: HTMLElement, test: (c: HTMLElement) => boolean) =>
  el.childNodes.find((n): n is HTMLElement => n instanceof HTMLElement && test(n));

/** Link -> destination; null drops the item (excluded path or unwrapped Eras host). */
function destinationOf(a: HTMLElement, ctx: NavCtx): NavigationItem['destination'] | null {
  const raw = a.getAttribute('href') ?? '';
  const line = ctx.lineOf(a.range[0]);
  const href = processHref(raw, ctx.file, line, ctx.stats);
  if (href === null || (href.startsWith('/') && EXCLUDED.test(href))) {
    ctx.dropped.push(`${ctx.file}:${line} ${raw}`);
    return null;
  }
  if (href.startsWith('#')) return { kind: 'anchor', hash: href };
  if (!href.startsWith('/')) return { kind: 'external', href };
  const found = resolvePath(ctx.routes, href);
  if (!found)
    throw new Error(`${ctx.file}:${line}: menu href ${raw} (${href}) resolves to no route`);
  return { kind: 'internal', routeId: found.route.id };
}

function item(
  a: HTMLElement,
  place: string,
  ctx: NavCtx,
  noDestination = false,
): NavigationItem | null {
  const destination = noDestination ? undefined : destinationOf(a, ctx);
  if (destination === null) return null;
  const text = label(a, ctx.stats);
  const key = destination?.kind === 'internal' ? destination.routeId.slice(6) : slug(text);
  return {
    id: `nav-${place}-${ctx.locale}-${key}`,
    label: text,
    ...(destination && { destination }),
  };
}

/** Header menu tree; a custom (non-page) parent with children has no destination. */
export function readHeader(root: HTMLElement, ctx: NavCtx): NavigationItem[] {
  const read = (li: HTMLElement): NavigationItem | null => {
    const a = child(li, (c) => c.rawTagName.toLowerCase() === 'a');
    if (!a) throw new Error(`${ctx.file}:${ctx.lineOf(li.range[0])}: menu item has no link`);
    const sub = child(li, (c) => c.classList.contains('sub-menu'));
    const children = (sub?.childNodes ?? [])
      .filter(
        (n): n is HTMLElement => n instanceof HTMLElement && n.classList.contains('menu-item'),
      )
      .map(read)
      .filter((n): n is NavigationItem => !!n);
    const group = children.length > 0 && li.classList.contains('menu-item-type-custom');
    const node = item(a, 'header', ctx, group);
    return node && (children.length ? { ...node, children } : node);
  };
  return root
    .querySelectorAll('#masthead ul.header-nav-main > li.menu-item')
    .map(read)
    .filter((n): n is NavigationItem => !!n);
}

/** Footer link groups, each labelled by the heading of its column. */
function readFooter(root: HTMLElement, ctx: NavCtx): Navigation['footerGroups'] {
  const menus = root.querySelectorAll('footer#footer .ux-menu.stack');
  if (menus.length !== FOOTER_GROUPS.length)
    throw new Error(`Source drift: ${ctx.file} has ${menus.length} footer menus`);
  return menus.map((menu, i) => {
    const heading = menu.closest('.col')?.querySelector('h4');
    if (!heading)
      throw new Error(`${ctx.file}:${ctx.lineOf(menu.range[0])}: footer menu has no h4`);
    return {
      id: `footer-${FOOTER_GROUPS[i]}`,
      label: label(heading, ctx.stats),
      items: menu
        .querySelectorAll('a.ux-menu-link__link')
        .map((a) => item(a, 'footer', ctx))
        .filter((n): n is NavigationItem => !!n),
    };
  });
}

const flatten = (items: NavigationItem[]): NavigationItem[] =>
  items.flatMap((i) => [i, ...flatten(i.children ?? [])]);

export function importNavigation(erasDir: string, routes: RouteEntry[], stats: Stats) {
  const dropped: string[] = [];
  const navigation = (['vi', 'en'] as const).map((locale): Navigation => {
    const file = (kind: RouteEntry['kind']) => {
      const route = routes.find((r) => r.kind === kind && r.locale === locale);
      if (!route) throw new Error(`routes: no ${locale} ${kind} route`);
      return route.source.file;
    };
    const home = load(erasDir, file('home'));
    const ctx: NavCtx = { file: file('home'), locale, lineOf: home.lineOf, routes, stats, dropped };
    const header = readHeader(home.root, ctx);
    const links = flatten(header).filter((i) => i.destination);
    if (links.length !== HEADER_LINKS)
      throw new Error(
        `Source drift: ${ctx.file} has ${links.length} header links, expected ${HEADER_LINKS}`,
      );

    // Service selector: contact-form options, matched to the header service links by label.
    const contactFile = file('contact');
    const contact = load(erasDir, contactFile);
    const serviceOptions = contact.root
      .querySelectorAll('select[name^=dynamic_select] option')
      .filter((o) => o.getAttribute('value'))
      .flatMap((option): NavigationItem[] => {
        const text = label(option, stats);
        const wanted = text.toLowerCase().replace(/^dịch vụ /, '');
        const link = links.find((l) => l.label.toLowerCase() === wanted);
        if (link?.destination?.kind !== 'internal') {
          if (NOT_A_SERVICE.test(text)) {
            dropped.push(`${contactFile}:${contact.lineOf(option.range[0])} option ${text}`);
            return [];
          }
          throw new Error(`${contactFile}: service option "${text}" matches no header service`);
        }
        const key = link.destination.routeId.slice(6);
        return [
          { id: `nav-service-option-${locale}-${key}`, label: text, destination: link.destination },
        ];
      });
    if (serviceOptions.length !== SERVICE_OPTIONS)
      throw new Error(
        `Source drift: ${contactFile} has ${serviceOptions.length} service options, expected ${SERVICE_OPTIONS}`,
      );

    // Mobile shows the header tree: one source, built once.
    return {
      locale,
      header,
      mobile: header,
      footerGroups: readFooter(home.root, ctx),
      serviceOptions,
    };
  });
  return { navigation, dropped };
}
