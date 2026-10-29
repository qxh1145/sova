// Claymorphism building blocks for the service illustrations (H2). See IMAGE-SYSTEM.md §3b.
// Puffy, matte shapes: a diagonal light-to-shade fill, a soft inner highlight on the top-left rim,
// a soft inner shadow on the bottom-right rim and a drop shadow cast down. Pure string builders.
import { n } from './svg.mjs';

// [light, base, shade] per clay colour. Sova blue is the body colour; the rest are accents.
export const C = {
  sova: ['#4D95FF', '#0065DF', '#004BB0'],
  blue: ['#7DB4FF', '#2F80FF', '#155FD6'],
  violet: ['#B19BFF', '#7A5CFF', '#5236DB'],
  coral: ['#FF9F8A', '#FF5E4A', '#D93B2B'],
  yellow: ['#FFE592', '#FFC328', '#E39A00'],
  mint: ['#86F3CF', '#22D39C', '#0B9C70'],
  pink: ['#FFA3CF', '#FF5AA0', '#D5337A'],
  cyan: ['#93E9FF', '#25C4F0', '#0891BC'],
  cream: ['#FFFFFF', '#EDF2FC', '#C7D2E8'],
  mist: ['#D9E4FA', '#B5C6EA', '#8FA3CF'],
  ink: ['#3B4768', '#262F4B', '#171D33'],
};

/**
 * <defs> for one illustration. `p` prefixes ids; `k` scales every blur/offset (k = 1 at a
 * 1300 px wide canvas). Filters: xs / s / m / l / xl (by object size) and `in` (pressed).
 */
export function clayDefs(p, k = 1) {
  let s = '';
  for (const [name, [lt, base, sh]] of Object.entries(C)) {
    s += `<linearGradient id="${p}-${name}" x1="0" y1="0" x2=".85" y2="1"><stop offset="0" stop-color="${lt}"/><stop offset=".55" stop-color="${base}"/><stop offset="1" stop-color="${sh}"/></linearGradient>`;
    s += `<linearGradient id="${p}-${name}-in" x1="0" y1="0" x2=".85" y2="1"><stop offset="0" stop-color="${sh}"/><stop offset=".5" stop-color="${base}"/><stop offset="1" stop-color="${lt}"/></linearGradient>`;
    s += `<radialGradient id="${p}-${name}-ball" cx=".36" cy=".3" r=".78"><stop offset="0" stop-color="${lt}"/><stop offset=".55" stop-color="${base}"/><stop offset="1" stop-color="${sh}"/></radialGradient>`;
  }
  const f = (id, b, d, hl, sh, db, dy, dop) =>
    `<filter id="${p}-${id}" x="-40%" y="-40%" width="180%" height="190%" color-interpolation-filters="sRGB">` +
    `<feGaussianBlur in="SourceAlpha" stdDeviation="${n(b * k)}" result="bl"/>` +
    `<feOffset in="bl" dx="${n(d * k)}" dy="${n(d * k)}" result="o1"/>` +
    `<feComposite in="SourceAlpha" in2="o1" operator="out" result="r1"/>` +
    `<feFlood flood-color="#fff" flood-opacity="${hl}"/><feComposite in2="r1" operator="in" result="hl"/>` +
    `<feOffset in="bl" dx="${n(-d * k)}" dy="${n(-d * k)}" result="o2"/>` +
    `<feComposite in="SourceAlpha" in2="o2" operator="out" result="r2"/>` +
    `<feFlood flood-color="#0B0830" flood-opacity="${sh}"/><feComposite in2="r2" operator="in" result="sh"/>` +
    (dop
      ? `<feGaussianBlur in="SourceAlpha" stdDeviation="${n(db * k)}" result="db"/>` +
        `<feOffset in="db" dx="${n(dy * 0.3 * k)}" dy="${n(dy * k)}" result="dbo"/>` +
        `<feFlood flood-color="#02030A" flood-opacity="${dop}"/><feComposite in2="dbo" operator="in" result="drop"/>` +
        `<feMerge><feMergeNode in="drop"/><feMergeNode in="SourceGraphic"/><feMergeNode in="sh"/><feMergeNode in="hl"/></feMerge>`
      : `<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sh"/><feMergeNode in="hl"/></feMerge>`) +
    `</filter>`;
  s += f('xs', 1.6, 1.2, 0.55, 0.28, 2.5, 2.5, 0.35);
  s += f('s', 3, 2.2, 0.6, 0.32, 5, 5, 0.42);
  s += f('m', 6, 4.5, 0.6, 0.35, 10, 11, 0.5);
  s += f('l', 10, 7, 0.55, 0.38, 18, 20, 0.55);
  s += f('xl', 15, 10, 0.5, 0.4, 28, 32, 0.6);
  // pressed: shadow on the top-left rim, light on the bottom-right rim, no drop shadow
  s +=
    `<filter id="${p}-in" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">` +
    `<feGaussianBlur in="SourceAlpha" stdDeviation="${n(5 * k)}" result="bl"/>` +
    `<feOffset in="bl" dx="${n(4 * k)}" dy="${n(4 * k)}" result="o1"/>` +
    `<feComposite in="SourceAlpha" in2="o1" operator="out" result="r1"/>` +
    `<feFlood flood-color="#0B0830" flood-opacity=".32"/><feComposite in2="r1" operator="in" result="sh"/>` +
    `<feOffset in="bl" dx="${n(-4 * k)}" dy="${n(-4 * k)}" result="o2"/>` +
    `<feComposite in="SourceAlpha" in2="o2" operator="out" result="r2"/>` +
    `<feFlood flood-color="#fff" flood-opacity=".5"/><feComposite in2="r2" operator="in" result="hl"/>` +
    `<feMerge><feMergeNode in="SourceGraphic"/><feMergeNode in="sh"/><feMergeNode in="hl"/></feMerge></filter>`;
  s += `<filter id="${p}-glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="${n(60 * k)}"/></filter>`;
  return s;
}

const fill = (p, col, kind) => (col.startsWith('#') || col.startsWith('url') ? col : `url(#${p}-${col}${kind})`);

/** Puffy rounded rectangle. */
export const rect = (p, x, y, w, h, r, col, f = 'm', extra = '') =>
  `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(Math.min(r, w / 2, h / 2))}" fill="${fill(p, col, '')}"${f ? ` filter="url(#${p}-${f})"` : ''}${extra}/>`;

/** Pressed-in rounded rectangle (a screen recess, a slot). */
export const inset = (p, x, y, w, h, r, col) =>
  `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" rx="${n(Math.min(r, w / 2, h / 2))}" fill="${fill(p, col, '-in')}" filter="url(#${p}-in)"/>`;

/** Pill (a placeholder text line). */
export const pill = (p, x, y, w, h, col, f = 'xs') => rect(p, x, y, w, h, h / 2, col, f);

/** Clay ball: radial light, still gets the rim + drop shadow. */
export const ball = (p, x, y, r, col, f = 'm') =>
  `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="url(#${p}-${col}-ball)"${f ? ` filter="url(#${p}-${f})"` : ''}/>`;

/** Disc with the linear clay fill (buttons, dots, avatars). */
export const disc = (p, x, y, r, col, f = 's') =>
  `<circle cx="${n(x)}" cy="${n(y)}" r="${n(r)}" fill="${fill(p, col, '')}"${f ? ` filter="url(#${p}-${f})"` : ''}/>`;

/** Any path with a clay fill. */
export const shape = (p, d, col, f = 'm', extra = '') =>
  `<path d="${d}" fill="${fill(p, col, '')}"${f ? ` filter="url(#${p}-${f})"` : ''}${extra}/>`;

/** A path with its corners rounded off (fill + same-colour round-join stroke): stars, arrows. */
export const soft = (p, d, col, round, f = 'm') =>
  `<path d="${d}" fill="${fill(p, col, '')}" stroke="${fill(p, col, '')}" stroke-width="${n(round)}" stroke-linejoin="round"${f ? ` filter="url(#${p}-${f})"` : ''}/>`;

/** Pointer cursor, tip at (x, y), ~80·s wide. */
export const cursorPath = (x, y, s) =>
  `M${n(x)} ${n(y)}l0 ${n(96 * s)} ${n(26 * s)}-${n(24 * s)} ${n(18 * s)} ${n(40 * s)} ${n(18 * s)}-${n(8 * s)}-${n(18 * s)}-${n(40 * s)} ${n(36 * s)} 0z`;

/** A clay ring (torus seen from the front): a stroked circle with the clay filter. */
export const ring = (p, cx, cy, r, col, w, f = 'm') =>
  `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="none" stroke="${fill(p, col, '')}" stroke-width="${n(w)}"${f ? ` filter="url(#${p}-${f})"` : ''}/>`;

/** A thick puffy stroke (a tube), drawn as a stroked path with the clay filter. */
export const tube = (p, d, col, w, f = 's') =>
  `<path d="${d}" fill="none" stroke="${fill(p, col, '')}" stroke-width="${n(w)}" stroke-linecap="round" stroke-linejoin="round" filter="url(#${p}-${f})"/>`;

/** Five-point star path centred at (x, y). */
export function star(x, y, R, r = R * 0.48, round = 0) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const rr = i % 2 ? r : R;
    pts.push([x + rr * Math.cos(a), y + rr * Math.sin(a)]);
  }
  return `M${pts.map(([a, b]) => `${n(a)} ${n(b)}`).join('L')}Z`;
}

/** Heart path centred at (x, y), width ≈ 2s. */
export const heart = (x, y, s) =>
  `M${n(x)} ${n(y + s * 0.9)}C${n(x - s * 1.25)} ${n(y + s * 0.1)} ${n(x - s * 0.9)} ${n(y - s * 0.95)} ${n(x)} ${n(y - s * 0.35)}C${n(x + s * 0.9)} ${n(y - s * 0.95)} ${n(x + s * 1.25)} ${n(y + s * 0.1)} ${n(x)} ${n(y + s * 0.9)}Z`;

/** Soft coloured light behind the group, so the clay reads on the dark hero. */
export const glow = (p, list) =>
  `<g filter="url(#${p}-glow)">${list.map((b) => `<ellipse cx="${n(b.x)}" cy="${n(b.y)}" rx="${n(b.rx)}" ry="${n(b.ry)}" fill="${b.c}" opacity="${b.o}"/>`).join('')}</g>`;
