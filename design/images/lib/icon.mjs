// Compact clay icons (P3). Each icon is a standalone SVG that carries only the gradients and
// filters it uses, so most stay under 4 KB. Content is drawn in a design space (`vw` × `vh`) and
// scaled into the file's intrinsic size (`w` × `h`), which is also its viewBox.
//
//   const svg = clayIcon({ w: 512, h: 512, vw: 70, vh: 70, drop: 'tile' }, (k) => k.tile() + k.R(...));
//
// Colour keys (light → base → shade, the same palette as lib/clay.mjs):
export const PAL = {
  b: ['#4D95FF', '#0065DF', '#004BB0'], // Sova blue
  l: ['#7DB4FF', '#2F80FF', '#155FD6'], // light blue
  v: ['#B19BFF', '#7A5CFF', '#5236DB'], // violet
  k: ['#FF9F8A', '#FF5E4A', '#D93B2B'], // coral
  y: ['#FFE592', '#FFC328', '#E39A00'], // yellow
  m: ['#86F3CF', '#22D39C', '#0B9C70'], // mint
  p: ['#FFA3CF', '#FF5AA0', '#D5337A'], // pink
  c: ['#93E9FF', '#25C4F0', '#0891BC'], // cyan
  w: ['#FFFFFF', '#EDF2FC', '#C7D2E8'], // cream
  s: ['#D9E4FA', '#B5C6EA', '#8FA3CF'], // mist
  g: ['#5BE070', '#28CD41', '#1FA834'], // check green (#28CD41)
  n: ['#2B3654', '#1E263D', '#151B2C'], // navy pad
  r: ['#8C8C8C', '#666666', '#4A4A4A'], // grey (#666)
};

const r2 = (x) => (Number.isInteger(x) ? String(x) : String(Math.round(x * 100) / 100).replace(/^(-?)0\./, '$1.'));

// Puffy clay filter: inner highlight (top-left), inner shadow (bottom-right), soft drop shadow.
// [blur, offset, highlight, shade, drop blur, drop dy, drop opacity]
const SIZES = {
  a: [0.8, 0.6, 0.55, 0.3, 0.9, 0.9, 0.35],
  c: [1.6, 1.2, 0.6, 0.35, 1.6, 1.6, 0.4],
  d: [2.4, 1.8, 0.55, 0.38, 2.6, 2.6, 0.45],
  e: [3.4, 2.5, 0.5, 0.4, 4, 4, 0.5],
  T: [3, 2.5, 0.45, 0.4, 0, 0, 0], // tile: no drop shadow (it fills the canvas)
};

/**
 * @param {{w:number,h:number,vw?:number,vh?:number,drop?:'tile'|'dark',color?:string}} o
 * @param {(k:ReturnType<typeof kit>)=>string} draw
 */
export function clayIcon(o, draw) {
  // Budget: 6 KB. A dense icon first drops its smallest filter size ('a' becomes 'c').
  const full = render(o, draw, false);
  return full.length <= 6000 ? full : render(o, draw, true);
}

function render(o, draw, lean) {
  const { w, h } = o;
  const vw = o.vw ?? w;
  const vh = o.vh ?? h;
  const k = kit(vw, vh, o.drop === 'tile' ? '#002058' : '#000', lean);
  const body = draw(k);
  const s = Math.min(w / vw, h / vh);
  const tx = (w - vw * s) / 2;
  const ty = (h - vh * s) / 2;
  const tf = s === 1 && !tx && !ty ? '' : ` transform="${tx || ty ? `translate(${r2(tx)} ${r2(ty)}) ` : ''}scale(${r2(Math.round(s * 10000) / 10000)})"`;
  const inner = tf ? `<g${tf}>${body}</g>` : body;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${o.wAttr ?? w}" height="${o.hAttr ?? h}" viewBox="0 0 ${w} ${h}" fill="none"${k.usesFilters() ? ' color-interpolation-filters="sRGB"' : ''}>${k.defs()}${inner}</svg>`;
}

function kit(vw, vh, dropColor, lean) {
  const grads = new Map();
  const filters = new Set();
  const extra = [];
  const g = (key, kind = 'l') => {
    grads.set(`${key}${kind}`, [key, kind]);
    return `url(#${key}${kind})`;
  };
  const f = (size) => {
    if (!size) return '';
    if (lean && size === 'a') size = 'c';
    filters.add(size);
    return ` filter="url(#f${size})"`;
  };
  const k = {
    vw,
    vh,
    g,
    f,
    /** raw defs (patterns, masks) */
    def: (s) => extra.push(s),
    /** full-bleed Sova tile */
    tile: (col = 'b', r = 20) => `<rect width="${vw}" height="${vh}" rx="${r}" fill="${g(col)}"${f('T')}/>`,
    R: (x, y, w, h, r, col, sz) => `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}" rx="${r2(r)}" fill="${col.startsWith('#') ? col : g(col)}"${f(sz)}/>`,
    C: (cx, cy, r, col, sz) => `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(r)}" fill="${col.startsWith('#') ? col : g(col)}"${f(sz)}/>`,
    B: (cx, cy, r, col, sz) => `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(r)}" fill="${g(col, 'r')}"${f(sz)}/>`,
    E: (cx, cy, rx, ry, col, sz, rot = 0) => `<ellipse cx="${r2(cx)}" cy="${r2(cy)}" rx="${r2(rx)}" ry="${r2(ry)}" fill="${col.startsWith('#') ? col : g(col)}"${rot ? ` transform="rotate(${rot} ${r2(cx)} ${r2(cy)})"` : ''}${f(sz)}/>`,
    P: (d, col, sz, attrs = '') => `<path d="${d}" fill="${col.startsWith('#') ? col : g(col)}"${attrs}${f(sz)}/>`,
    /** rounded stroke; a gradient key or a #hex */
    // Strokes use the solid base colour: a gradient on a straight line (zero-width bounding box)
    // does not paint at all.
    S: (d, col, width, sz, attrs = '') => `<path d="${d}" stroke="${col.startsWith('#') ? col : PAL[col][1]}" stroke-width="${r2(width)}" stroke-linecap="round" stroke-linejoin="round"${attrs}${f(sz)}/>`,
    /** soft filled shape: fill + same-colour round stroke (rounds the corners of stars, arrows) */
    soft: (d, col, width, sz) => `<path d="${d}" fill="${g(col)}" stroke="${g(col)}" stroke-width="${r2(width)}" stroke-linejoin="round"${f(sz)}/>`,
    /** specular dab */
    hl: (cx, cy, rx, ry, rot = -35, o = 0.55) => `<ellipse cx="${r2(cx)}" cy="${r2(cy)}" rx="${r2(rx)}" ry="${r2(ry)}" fill="#fff" opacity="${o}" transform="rotate(${rot} ${r2(cx)} ${r2(cy)})"/>`,
    usesFilters: () => filters.size > 0,
    defs() {
      let out = '';
      for (const [, [key, kind]] of grads) {
        const [a, b, c] = PAL[key];
        out +=
          kind === 'r'
            ? `<radialGradient id="${key}r" cx=".35" cy=".3" r=".75"><stop stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></radialGradient>`
            : `<linearGradient id="${key}l" x2=".85" y2="1"><stop stop-color="${a}"/><stop offset=".55" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>`;
      }
      for (const size of filters) out += filterDef(size, vw, vh, dropColor);
      out += extra.join('');
      return out ? `<defs>${out}</defs>` : '';
    },
  };
  return k;
}

function filterDef(size, vw, vh, dropColor) {
  const [b, d, hl, sh, db, dy, dop] = SIZES[size];
  const m = Math.max(vw, vh) * 0.1;
  const region = `filterUnits="userSpaceOnUse" x="${r2(-m)}" y="${r2(-m)}" width="${r2(vw + 2 * m)}" height="${r2(vh + 2 * m)}"`;
  const drop = dop
    ? `<feGaussianBlur in="SourceAlpha" stdDeviation="${r2(db)}"/><feOffset dy="${r2(dy)}" result="do"/><feFlood flood-color="${dropColor}" flood-opacity="${r2(dop)}"/><feComposite in2="do" operator="in" result="ds"/>`
    : '';
  return (
    `<filter id="f${size}" ${region}>` +
    `<feGaussianBlur in="SourceAlpha" stdDeviation="${r2(b)}" result="b"/>` +
    `<feOffset in="b" dx="${r2(d)}" dy="${r2(d)}" result="o1"/><feComposite in="SourceAlpha" in2="o1" operator="out" result="r1"/><feFlood flood-color="#fff" flood-opacity="${r2(hl)}"/><feComposite in2="r1" operator="in" result="h"/>` +
    `<feOffset in="b" dx="${r2(-d)}" dy="${r2(-d)}" result="o2"/><feComposite in="SourceAlpha" in2="o2" operator="out" result="r2"/><feFlood flood-color="#0B0830" flood-opacity="${r2(sh)}"/><feComposite in2="r2" operator="in" result="s"/>` +
    drop +
    `<feMerge>${dop ? '<feMergeNode in="ds"/>' : ''}<feMergeNode in="SourceGraphic"/><feMergeNode in="s"/><feMergeNode in="h"/></feMerge></filter>`
  );
}

// ---------------------------------------------------------------- shape paths
export const star = (cx, cy, ro, ri, pts = 5, rot = -90) => {
  let d = '';
  for (let i = 0; i < pts * 2; i++) {
    const r = i % 2 ? ri : ro;
    const a = ((rot + (i * 180) / pts) * Math.PI) / 180;
    d += `${i ? 'L' : 'M'}${r2(cx + r * Math.cos(a))} ${r2(cy + r * Math.sin(a))}`;
  }
  return d + 'Z';
};

/** 4-point sparkle */
export const sparkle = (cx, cy, r, w = 0.28) => {
  const q = r * w;
  return `M${r2(cx)} ${r2(cy - r)}Q${r2(cx + q)} ${r2(cy - q)} ${r2(cx + r)} ${r2(cy)}Q${r2(cx + q)} ${r2(cy + q)} ${r2(cx)} ${r2(cy + r)}Q${r2(cx - q)} ${r2(cy + q)} ${r2(cx - r)} ${r2(cy)}Q${r2(cx - q)} ${r2(cy - q)} ${r2(cx)} ${r2(cy - r)}Z`;
};

export const heart = (cx, cy, s) =>
  `M${r2(cx)} ${r2(cy + s * 0.9)}C${r2(cx - s * 1.25)} ${r2(cy + s * 0.05)} ${r2(cx - s * 0.95)} ${r2(cy - s * 0.95)} ${r2(cx)} ${r2(cy - s * 0.35)}C${r2(cx + s * 0.95)} ${r2(cy - s * 0.95)} ${r2(cx + s * 1.25)} ${r2(cy + s * 0.05)} ${r2(cx)} ${r2(cy + s * 0.9)}Z`;

/** an arc from angle a0 to a1 (degrees, 0 = 3 o'clock) as a path for stroking */
export const arc = (cx, cy, r, a0, a1) => {
  const p = (a) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  const large = Math.abs(a1 - a0) > 180 ? 1 : 0;
  return `M${r2(x0)} ${r2(y0)}A${r2(r)} ${r2(r)} 0 ${large} ${a1 > a0 ? 1 : 0} ${r2(x1)} ${r2(y1)}`;
};

export const rot = (deg, cx, cy, body) => `<g transform="rotate(${deg} ${r2(cx)} ${r2(cy)})">${body}</g>`;
export const move = (x, y, body, s = 1) => `<g transform="translate(${r2(x)} ${r2(y)})${s !== 1 ? ` scale(${r2(s)})` : ''}">${body}</g>`;
