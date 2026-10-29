// Deep Glass building blocks (see IMAGE-SYSTEM.md). Pure string builders, no dependencies.
import { n, grainDefs } from './svg.mjs';

export const T = {
  base: '#07080B',
  base2: '#0A0C12',
  floor: '#131518',
  paneFill: '#0C1019',
  navy: '#0A1A33',
  navy2: '#0A3A8C',
  primary: '#0065DF',
  light: '#4F94FF',
  ice: '#9CC3FF',
  violet: '#5B4BFF',
  white: '#FFFFFF',
};

/**
 * Shared <defs>. `p` prefixes every id so several images can coexist in one document.
 * `blur` is the aurora bloom radius (hero scale ~110), `frost` the in-pane blur (~50).
 */
export function glassDefs(p, { blur = 110, frost = 50, shadow = 26, grainSeed = 5 } = {}) {
  return (
    `<filter id="${p}-bloom" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="${blur}"/></filter>` +
    `<filter id="${p}-frost" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="${frost}"/></filter>` +
    `<filter id="${p}-shadow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${shadow}"/></filter>` +
    `<filter id="${p}-dof1" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5"/></filter>` +
    `<filter id="${p}-dof2" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="7"/></filter>` +
    `<filter id="${p}-soft" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="6"/></filter>` +
    `<linearGradient id="${p}-sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".11"/><stop offset=".5" stop-color="#fff" stop-opacity=".03"/><stop offset="1" stop-color="#fff" stop-opacity=".01"/></linearGradient>` +
    `<linearGradient id="${p}-edge" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset=".45" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity=".04"/></linearGradient>` +
    `<linearGradient id="${p}-ghost" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".5" stop-color="#fff" stop-opacity=".06"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>` +
    `<linearGradient id="${p}-blue" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4F94FF"/><stop offset="1" stop-color="#0065DF"/></linearGradient>` +
    `<linearGradient id="${p}-iceblue" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9CC3FF"/><stop offset="1" stop-color="#0065DF"/></linearGradient>` +
    `<linearGradient id="${p}-photo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#0A3A8C"/><stop offset=".6" stop-color="#0065DF" stop-opacity=".75"/><stop offset="1" stop-color="#5B4BFF" stop-opacity=".55"/></linearGradient>` +
    grainDefs(`${p}-grain`, { seed: grainSeed })
  );
}

/** Aurora blobs: [{x, y, rx, ry, c, o}] */
export const blobs = (list) =>
  list.map((b) => `<ellipse cx="${n(b.x)}" cy="${n(b.y)}" rx="${n(b.rx)}" ry="${n(b.ry)}" fill="${b.c}" opacity="${b.o}"/>`).join('');

export const aurora = (p, list) => `<g filter="url(#${p}-bloom)">${blobs(list)}</g>`;

/**
 * A frosted pane. Content is drawn in the pane's own (unrotated) coordinates.
 *   frost: aurora blobs to show through the glass (already in the same coordinates)
 *   dof: 0 | 1 | 2 (blur level), fill: interior opacity (lower = more see-through)
 */
export function pane(p, { id, x, y, w, h, r, rot = -7, content = '', frost = [], dof = 0, sheen = 0.9, fill = 1, shadow = true, edge = 1 }) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const rr = r ?? Math.round(Math.max(w, h) * 0.07);
  let s = `<clipPath id="${p}-${id}-c"><rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(rr)}"/></clipPath>`;
  s += `<g transform="rotate(${rot} ${n(cx)} ${n(cy)})"${dof ? ` filter="url(#${p}-dof${dof})"` : ''}>`;
  if (shadow) {
    const k = Math.max(w, h) / 400;
    s += `<rect x="${n(x + 16 * k)}" y="${n(y + 30 * k)}" width="${n(w)}" height="${n(h)}" rx="${n(rr)}" fill="#000" opacity=".55" filter="url(#${p}-shadow)"/>`;
  }
  s += `<g clip-path="url(#${p}-${id}-c)">`;
  s += `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="${T.paneFill}" opacity="${fill}"/>`;
  if (frost.length) s += `<g filter="url(#${p}-frost)">${blobs(frost)}</g>`;
  s += `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="url(#${p}-sheen)" opacity="${sheen}"/>`;
  s += content;
  s += `</g>`;
  s += `<rect x="${n(x + 0.75)}" y="${n(y + 0.75)}" width="${n(w - 1.5)}" height="${n(h - 1.5)}" rx="${n(rr - 0.75)}" fill="none" stroke="url(#${p}-edge)" stroke-width="${n(1.5 * edge)}"/>`;
  s += `</g>`;
  return s;
}

/** A ghost pane: rim + faint fill only (for backgrounds that sit behind an illustration). */
export function ghost(p, { x, y, w, h, r, rot = -7, o = 1, content = '' }) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const rr = r ?? Math.round(Math.max(w, h) * 0.07);
  return (
    `<g transform="rotate(${rot} ${n(cx)} ${n(cy)})" opacity="${o}">` +
    `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(rr)}" fill="#fff" fill-opacity=".025" stroke="url(#${p}-ghost)" stroke-width="1.5"/>` +
    content +
    `</g>`
  );
}

// ------------------------------------------------------------------ abstract UI pieces
export const bar = (x, y, w, h, o = 0.2, c = '#fff') =>
  `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(h / 2)}" fill="${c}" opacity="${o}"/>`;

export const dot = (x, y, r, c = '#fff', o = 1) =>
  `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${c}" opacity="${o}"/>`;

export const box = (x, y, w, h, r, fill, o = 1, extra = '') =>
  `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(r)}" fill="${fill}" opacity="${o}"${extra}/>`;

/** Browser chrome: three dots and an address pill. */
export function chrome(x, y, w, k = 1) {
  let s = '';
  for (let i = 0; i < 3; i++) s += dot(x + (10 + i * 16) * k, y + 12 * k, 4.5 * k, '#fff', i === 0 ? 0.55 : 0.22);
  s += bar(x + 70 * k, y + 6 * k, w * 0.42, 12 * k, 0.12);
  s += box(x - 0, y + 26 * k, w, 1 * k, 0, '#fff', 0.12);
  return s;
}

/** Abstract card: image block + two bars. */
export function card(p, x, y, w, h, k = 1, lit = false) {
  let s = box(x, y, w, h, 12 * k, '#fff', 0.05);
  s += box(x + 8 * k, y + 8 * k, w - 16 * k, h * 0.5, 9 * k, lit ? `url(#${p}-photo)` : '#fff', lit ? 0.9 : 0.07);
  s += bar(x + 10 * k, y + h * 0.5 + 18 * k, w * 0.62, 8 * k, 0.32);
  s += bar(x + 10 * k, y + h * 0.5 + 34 * k, w * 0.4, 8 * k, 0.16);
  return s;
}

/** Geometric cursor arrow pointing up-left at (x, y). */
export const cursor = (x, y, k = 1) =>
  `<path d="M${n(x)} ${n(y)}l${n(26 * k)} ${n(62 * k)} ${n(9 * k)}-${n(25 * k)} ${n(25 * k)}-${n(9 * k)}z" fill="#FEFEFE" stroke="#0A0C12" stroke-width="${n(2 * k)}" stroke-linejoin="round"/>`;

/** Dark wall: hold a region at base colour (linear only — circular vignettes band). */
export function wallX(p, id, x0, x1, H, color = T.base) {
  return (
    `<linearGradient id="${p}-${id}" x1="${n(x0)}" y1="0" x2="${n(x1)}" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${color}"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient>`
  );
}
