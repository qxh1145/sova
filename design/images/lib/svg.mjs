// Small helpers shared by every image generator. No dependencies.

/** Round to `d` decimals and drop trailing zeros, to keep sources small. */
export const n = (v, d = 1) => {
  const r = Number(v.toFixed(d));
  return Object.is(r, -0) ? '0' : String(r);
};

/** Points array [[x,y],…] → "x,y x,y" */
export const pts = (list) => list.map(([x, y]) => `${n(x)},${n(y)}`).join(' ');

/** Polygon path "M…Z" from points. */
export const poly = (list) => `M${list.map(([x, y]) => `${n(x)} ${n(y)}`).join('L')}Z`;

/** Root <svg> wrapper. */
export const svg = (w, h, body, { title } = {}) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">` +
  (title ? `<title>${title}</title>` : '') +
  body +
  `</svg>\n`;

/**
 * Film grain as a filter + a full-canvas rect that uses it.
 * White specks whose alpha follows fractal noise; masked to the lit side.
 * Banding in dark gradients is handled by the dither step in build.mjs.
 */
export const grainDefs = (id, { freq = 0.9, seed = 7 } = {}) =>
  `<filter id="${id}" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">` +
  `<feTurbulence type="fractalNoise" baseFrequency="${freq}" numOctaves="2" seed="${seed}" stitchTiles="stitch"/>` +
  // white specks: alpha follows the noise, only its upper half shows
  `<feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  2.2 0 0 0 -1.05"/>` +
  `</filter>`;

/** Grain rect. `mask` limits it (e.g. to the lit side) so text zones stay clean. */
export const grainRect = (id, w, h, opacity = 0.05, mask = '') =>
  `<rect width="${w}" height="${h}" filter="url(#${id})" opacity="${opacity}"${mask ? ` mask="url(#${mask})"` : ''}/>`;

/** Isometric projector: returns f(x, y, z) → [sx, sy]. */
export const isoProjector = (cx, cy, unit = 1) => {
  const C = Math.cos(Math.PI / 6);
  const S = 0.5;
  return (x, y, z = 0) => [cx + (x - y) * C * unit, cy + ((x + y) * S - z) * unit];
};

/** Cubic bezier point. */
export const bez = (p0, p1, p2, p3, t) => {
  const u = 1 - t;
  return [0, 1].map(
    (i) => u * u * u * p0[i] + 3 * u * u * t * p1[i] + 3 * u * t * t * p2[i] + t * t * t * p3[i],
  );
};

export const cubicPath = (p0, p1, p2, p3) =>
  `M${n(p0[0])} ${n(p0[1])}C${n(p1[0])} ${n(p1[1])} ${n(p2[0])} ${n(p2[1])} ${n(p3[0])} ${n(p3[1])}`;

/** Seeded PRNG (mulberry32) so builds are reproducible. */
export const rng = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
