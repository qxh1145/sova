// Direction A — "Blueprint": engineered hairline wireframes on a quiet grid.
import { svg, n, poly, grainDefs, grainRect, isoProjector } from '../lib/svg.mjs';

export const meta = {
  id: 'a-blueprint',
  name: 'Blueprint',
  palette: {
    base: '#0A0C0F',
    panel: '#11151B',
    steel: '#2A3340',
    steelLight: '#8A97A8',
    primary: '#0065DF',
    primaryLight: '#5C9DFF',
  },
};

const W = 2000;
const H = 900;

// Exploded isometric stack: three floating layers of a product, drawn as hairline plates.
function stack(cx, cy, unit) {
  const P = isoProjector(cx, cy, unit);
  const a = 300; // plate width (x)
  const b = 230; // plate depth (y)
  const t = 12; // plate thickness
  const levels = [0, 104, 208];
  const seg = (p, q, attrs) =>
    `<path d="M${n(p[0])} ${n(p[1])}L${n(q[0])} ${n(q[1])}" ${attrs}/>`;
  let s = '';

  // soft floor shadow under the stack
  const f = P(a / 2, b / 2, -30);
  s += `<ellipse cx="${n(f[0])}" cy="${n(f[1])}" rx="${n(250 * unit)}" ry="${n(90 * unit)}" fill="#0065DF" opacity=".16" filter="url(#a-blur)"/>`;

  // vertical dashed guides between layers (back corners first)
  for (const [x, y] of [
    [0, 0],
    [a, 0],
    [0, b],
    [a, b],
  ]) {
    s += seg(P(x, y, levels[0] + t), P(x, y, levels[2]), 'stroke="#2E3B4C" stroke-width="1" stroke-dasharray="3 6"');
  }

  levels.forEach((z, i) => {
    const top = [P(0, 0, z + t), P(a, 0, z + t), P(a, b, z + t), P(0, b, z + t)];
    const right = [P(a, 0, z), P(a, b, z), P(a, b, z + t), P(a, 0, z + t)];
    const left = [P(0, b, z), P(a, b, z), P(a, b, z + t), P(0, b, z + t)];
    const lead = i === 2;
    s += `<path d="${poly(left)}" fill="#0B0F15" stroke="#1D4C8A" stroke-width="1"/>`;
    s += `<path d="${poly(right)}" fill="#0A0D12" stroke="#1D4C8A" stroke-width="1"/>`;
    s += `<path d="${poly(top)}" fill="${lead ? 'url(#a-plateTop)' : '#0D1117'}" stroke="${lead ? '#4A90F5' : '#1F5CB3'}" stroke-width="${lead ? 1.6 : 1.2}"/>`;

    const zt = z + t;
    const face = (x0, y0, x1, y1) => poly([P(x0, y0, zt), P(x1, y0, zt), P(x1, y1, zt), P(x0, y1, zt)]);

    if (i === 2) {
      // top plate: a browser frame — chrome bar with three dots, hero block, list rows
      s += `<path d="${face(14, 14, a - 14, 40)}" fill="#0065DF" fill-opacity=".16" stroke="#3D86F0" stroke-width="1"/>`;
      for (let k = 0; k < 3; k++) {
        const [x, y] = P(28 + k * 14, 27, zt);
        s += `<ellipse cx="${n(x)}" cy="${n(y)}" rx="${n(4.2 * unit)}" ry="${n(2.4 * unit)}" fill="#5C9DFF" opacity="${k === 0 ? 1 : 0.45}"/>`;
      }
      s += `<path d="${face(14, 54, 152, b - 14)}" fill="#0065DF" fill-opacity=".1" stroke="#3D86F0" stroke-width="1"/>`;
      s += `<path d="${face(28, 70, 138, 132)}" fill="#0065DF" fill-opacity=".42"/>`;
      s += `<path d="${face(28, 146, 108, 160)}" fill="#CFE0FA" fill-opacity=".22"/>`;
      s += `<path d="${face(28, 172, 88, 186)}" fill="#CFE0FA" fill-opacity=".12"/>`;
      for (let k = 0; k < 4; k++) {
        const y0 = 58 + k * 40;
        s += `<path d="${face(166, y0, a - 14, y0 + 26)}" fill="#8A97A8" fill-opacity=".05" stroke="#2F6BC4" stroke-width="1"/>`;
      }
    } else if (i === 1) {
      // middle plate: component grid, a few cells lit
      for (let gx = 0; gx < 5; gx++) {
        for (let gy = 0; gy < 4; gy++) {
          const x0 = 20 + gx * 54;
          const y0 = 20 + gy * 50;
          const on = (gx * 7 + gy * 3) % 5 === 0;
          s += `<path d="${face(x0, y0, x0 + 42, y0 + 38)}" fill="#0065DF" fill-opacity="${on ? 0.3 : 0}" stroke="${on ? '#3D86F0' : '#1E4F96'}" stroke-width="1"/>`;
        }
      }
    } else {
      // bottom plate: fine ruling
      for (let gx = 25; gx < a; gx += 25) s += seg(P(gx, 0, zt), P(gx, b, zt), 'stroke="#173563" stroke-width="1"');
    }
  });

  // nodes on the lead plate corners
  for (const [x, y] of [P(0, 0, 220), P(a, 0, 220), P(a, b, 220), P(0, b, 220)]) {
    s += `<circle cx="${n(x)}" cy="${n(y)}" r="10" fill="#0065DF" opacity=".35" filter="url(#a-soft)"/>`;
    s += `<circle cx="${n(x)}" cy="${n(y)}" r="3.4" fill="#7FB2FF"/>`;
  }
  return s;
}

const crosshair = (x, y, r = 7, c = '#34414F') =>
  `<path d="M${x - r} ${y}H${x + r}M${x} ${y - r}V${y + r}" stroke="${c}" stroke-width="1"/>`;

export function h3() {
  const defs =
    `<defs>` +
    `<linearGradient id="a-base" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#090B0E"/><stop offset=".55" stop-color="#0A0C0F"/><stop offset="1" stop-color="#0D1015"/></linearGradient>` +
    `<linearGradient id="a-floor" x1="0" y1="0" x2="0" y2="1"><stop offset=".8" stop-color="#121417" stop-opacity="0"/><stop offset="1" stop-color="#141618"/></linearGradient>` +
    `<radialGradient id="a-glow" cx="1590" cy="430" r="470" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0065DF" stop-opacity=".2"/><stop offset=".55" stop-color="#0065DF" stop-opacity=".06"/><stop offset="1" stop-color="#0065DF" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="a-gridMask" cx="1590" cy="440" r="620" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"/><stop offset=".55" stop-color="#fff" stop-opacity=".4"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>` +
    `<mask id="a-gm" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="url(#a-gridMask)"/></mask>` +
    `<linearGradient id="a-plateTop" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#142744"/><stop offset="1" stop-color="#0C1118"/></linearGradient>` +
    `<pattern id="a-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#fff" stroke-opacity=".04" stroke-width="1"/></pattern>` +
    `<pattern id="a-grid5" width="200" height="200" patternUnits="userSpaceOnUse"><path d="M200 0H0V200" fill="none" stroke="#fff" stroke-opacity=".07" stroke-width="1"/></pattern>` +
    `<filter id="a-soft" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="4"/></filter>` +
    `<filter id="a-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="40"/></filter>` +
    grainDefs('a-grain', { seed: 11 }) +
    `</defs>`;

  const body =
    defs +
    `<rect width="${W}" height="${H}" fill="url(#a-base)"/>` +
    `<g mask="url(#a-gm)"><rect width="${W}" height="${H}" fill="url(#a-grid)"/><rect width="${W}" height="${H}" fill="url(#a-grid5)"/></g>` +
    `<rect width="${W}" height="${H}" fill="url(#a-glow)"/>` +
    crosshair(1400, 200) +
    crosshair(1800, 200) +
    crosshair(1800, 600) +
    crosshair(1400, 600) +
    stack(1569, 402, 1.04) +
    `<rect width="${W}" height="${H}" fill="url(#a-floor)"/>` +
    grainRect('a-grain', W, H, 0.05, 'a-gm');

  return svg(W, H, body);
}

// I4 sample — "Tiếp cận thêm khách hàng" (reach more customers): a storefront
// window whose signal reaches outward to new people.
export function i4() {
  const body =
    `<defs><linearGradient id="a-i-arc" x1="42" y1="0" x2="58" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0065DF"/><stop offset="1" stop-color="#5C9DFF"/></linearGradient></defs>` +
    `<rect x=".5" y=".5" width="69" height="69" rx="14" fill="#0F1216" stroke="#0065DF" stroke-opacity=".55"/>` +
    // corner registration ticks
    `<path d="M7 12V7h5M58 7h5v5M63 58v5h-5M12 63H7v-5" fill="none" stroke="#3A4555" stroke-width="1.2" stroke-linecap="round"/>` +
    `<g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.75">` +
    // browser window
    `<rect x="12" y="22" width="29" height="26" rx="3.5" stroke="#FEFEFE"/>` +
    `<path d="M12 28.5h29" stroke="#FEFEFE"/>` +
    `<path d="M18.5 34.5h7v7h-7z" stroke="#5C9DFF"/>` +
    `<path d="M29.5 35h6M29.5 40.5h4" stroke="#8A97A8"/>` +
    // reach arcs
    `<path d="M45 30.5a6 6 0 0 1 0 9M48.5 26a12 12 0 0 1 0 18M52 21.5a18 18 0 0 1 0 27" stroke="url(#a-i-arc)"/>` +
    `</g>` +
    `<circle cx="15.8" cy="25.3" r="1" fill="#FEFEFE"/><circle cx="19" cy="25.3" r="1" fill="#FEFEFE" opacity=".5"/>` +
    // people reached
    `<circle cx="59.5" cy="21.5" r="2.6" fill="#5C9DFF"/><circle cx="62" cy="35" r="2.6" fill="#FEFEFE"/><circle cx="59.5" cy="48.5" r="2.6" fill="#5C9DFF"/>`;
  return svg(70, 70, body);
}
