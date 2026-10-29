// Direction B — "Deep Glass": frosted layers floating in a cool aurora.
import { svg, n, grainDefs, grainRect } from '../lib/svg.mjs';

export const meta = {
  id: 'b-glass',
  name: 'Deep Glass',
  palette: {
    base: '#07080B',
    navy: '#0A1A33',
    primary: '#0065DF',
    primaryLight: '#4F94FF',
    violet: '#5B4BFF',
    glass: 'rgba(255,255,255,.08)',
    edge: 'rgba(255,255,255,.40)',
  },
};

const W = 2000;
const H = 900;

// Aurora light. Reused inside each pane (blurred again) to fake backdrop blur.
const aurora = () =>
  `<ellipse cx="1700" cy="420" rx="330" ry="210" fill="#0065DF" opacity=".62"/>` +
  `<ellipse cx="1900" cy="620" rx="210" ry="170" fill="#5B4BFF" opacity=".3"/>` +
  `<ellipse cx="1520" cy="640" rx="260" ry="90" fill="#0A3A8C" opacity=".45"/>`;

function pane({ x, y, w, h, r = 28, rot = -7, id, content = '', depthBlur = 0, sheen = 0.9 }) {
  const cx = x + w / 2;
  const cy = y + h / 2;
  const shape = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`;
  let s = `<clipPath id="${id}-c">${shape}</clipPath>`;
  s += `<g transform="rotate(${rot} ${n(cx)} ${n(cy)})"${depthBlur ? ` filter="url(#b-dof${depthBlur})"` : ''}>`;
  s += `<rect x="${x + 16}" y="${y + 30}" width="${w}" height="${h}" rx="${r}" fill="#000" opacity=".6" filter="url(#b-shadow)"/>`;
  // frosted backdrop: the aurora, blurred and lifted, clipped to the pane
  s += `<g clip-path="url(#${id}-c)"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#0C1019"/>`;
  s += `<g filter="url(#b-frost)">${aurora()}</g>`;
  s += `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#b-sheen)" opacity="${sheen}"/>`;
  s += content;
  s += `</g>`;
  // edge light: brightest on the top-right, where the key light sits
  s += `<rect x="${x + 0.75}" y="${y + 0.75}" width="${w - 1.5}" height="${h - 1.5}" rx="${r - 0.75}" fill="none" stroke="url(#b-edge)" stroke-width="1.5"/>`;
  s += `</g>`;
  return s;
}

function uiFront(x, y, w, h) {
  // abstract UI: title bar, avatar, rows, a blue pill. No text.
  const px = x + 28;
  let s = `<rect x="${px}" y="${y + 26}" width="${n(w * 0.34)}" height="12" rx="6" fill="#fff" opacity=".6"/>`;
  s += `<circle cx="${x + w - 42}" cy="${y + 32}" r="12" fill="#fff" opacity=".16"/>`;
  s += `<rect x="${px}" y="${y + 60}" width="${w - 56}" height="1" fill="#fff" opacity=".14"/>`;
  [0.8, 0.6, 0.7].forEach((k, i) => {
    s += `<rect x="${px}" y="${y + 82 + i * 28}" width="${n((w - 56) * k)}" height="9" rx="4.5" fill="#fff" opacity=".2"/>`;
  });
  s += `<rect x="${px}" y="${y + h - 50}" width="112" height="28" rx="14" fill="#0065DF"/>`;
  s += `<rect x="${px + 6}" y="${y + h - 48}" width="100" height="10" rx="5" fill="#fff" opacity=".14"/>`;
  return s;
}

function uiBack(x, y, w, h) {
  let s = '';
  const cols = 3;
  const gw = (w - 56 - (cols - 1) * 16) / cols;
  for (let i = 0; i < cols; i++) {
    const gx = x + 28 + i * (gw + 16);
    s += `<rect x="${n(gx)}" y="${y + 30}" width="${n(gw)}" height="${n(h * 0.42)}" rx="14" fill="#fff" opacity=".06"/>`;
    s += `<rect x="${n(gx)}" y="${n(y + 46 + h * 0.42)}" width="${n(gw * 0.7)}" height="8" rx="4" fill="#fff" opacity=".12"/>`;
  }
  return s;
}

export function h3() {
  const defs =
    `<defs>` +
    `<linearGradient id="b-base" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#07080B"/><stop offset=".6" stop-color="#08090C"/><stop offset="1" stop-color="#0A0C12"/></linearGradient>` +
    `<filter id="b-bloom" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="110"/></filter>` +
    `<filter id="b-frost" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="50"/></filter>` +
    `<filter id="b-shadow" x="-40%" y="-40%" width="180%" height="180%"><feGaussianBlur stdDeviation="26"/></filter>` +
    `<filter id="b-dof3" x="-45%" y="-45%" width="190%" height="190%"><feGaussianBlur stdDeviation="2.5"/></filter>` +
    `<filter id="b-dof8" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="7"/></filter>` +
    `<linearGradient id="b-sheen" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset=".5" stop-color="#fff" stop-opacity=".03"/><stop offset="1" stop-color="#fff" stop-opacity=".01"/></linearGradient>` +
    `<linearGradient id="b-edge" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".6"/><stop offset=".45" stop-color="#fff" stop-opacity=".12"/><stop offset="1" stop-color="#fff" stop-opacity=".04"/></linearGradient>` +
    `<linearGradient id="b-floor" x1="0" y1="0" x2="0" y2="1"><stop offset=".8" stop-color="#121417" stop-opacity="0"/><stop offset="1" stop-color="#131518"/></linearGradient>` +
    // hold the text side and the mobile strip dark: a linear wall, no circular ring
    `<linearGradient id="b-wall" x1="1080" y1="0" x2="1420" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#07080B"/><stop offset="1" stop-color="#07080B" stop-opacity="0"/></linearGradient>` +
    `<linearGradient id="b-top" x1="0" y1="0" x2="0" y2="200" gradientUnits="userSpaceOnUse"><stop offset=".3" stop-color="#07080B"/><stop offset="1" stop-color="#07080B" stop-opacity="0"/></linearGradient>` +
    `<radialGradient id="b-gm0" cx="1700" cy="460" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>` +
    `<mask id="b-gm" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="url(#b-gm0)"/></mask>` +
    grainDefs('b-grain', { seed: 5 }) +
    `</defs>`;

  const back = { x: 1330, y: 230, w: 400, h: 270 };
  const front = { x: 1480, y: 370, w: 320, h: 222 };
  const chip = { x: 1690, y: 250, w: 150, h: 64 };

  const body =
    defs +
    `<rect width="${W}" height="${H}" fill="url(#b-base)"/>` +
    `<g filter="url(#b-bloom)">${aurora()}</g>` +
    `<rect width="1420" height="${H}" fill="url(#b-wall)"/>` +
    `<rect width="${W}" height="200" fill="url(#b-top)"/>` +
    pane({ ...back, id: 'b-p1', depthBlur: 3, sheen: 0.7, content: uiBack(back.x, back.y, back.w, back.h) }) +
    pane({ ...front, id: 'b-p2', content: uiFront(front.x, front.y, front.w, front.h) }) +
    pane({
      ...chip,
      r: 32,
      id: 'b-p3',
      depthBlur: 8,
      content: `<circle cx="${chip.x + 32}" cy="${chip.y + 32}" r="14" fill="#0065DF"/><rect x="${chip.x + 58}" y="${chip.y + 27}" width="64" height="10" rx="5" fill="#fff" opacity=".3"/>`,
    }) +
    `<circle cx="1430" cy="640" r="10" fill="#4F94FF" opacity=".35" filter="url(#b-dof8)"/>` +
    `<circle cx="1860" cy="470" r="6" fill="#fff" opacity=".22" filter="url(#b-dof3)"/>` +
    `<rect width="${W}" height="${H}" fill="url(#b-floor)"/>` +
    grainRect('b-grain', W, H, 0.06, 'b-gm');

  return svg(W, H, body);
}

// I4 sample — frosted tile, white glyph with a blue core.
export function i4() {
  const body =
    `<defs>` +
    `<linearGradient id="b-i-fill" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".13"/><stop offset="1" stop-color="#fff" stop-opacity=".03"/></linearGradient>` +
    `<linearGradient id="b-i-edge" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".55"/><stop offset=".5" stop-color="#fff" stop-opacity=".1"/><stop offset="1" stop-color="#fff" stop-opacity=".04"/></linearGradient>` +
    `<radialGradient id="b-i-glow" cx="50" cy="52" r="38" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0065DF" stop-opacity=".7"/><stop offset="1" stop-color="#0065DF" stop-opacity="0"/></radialGradient>` +
    `<linearGradient id="b-i-arc" x1="44" y1="20" x2="62" y2="50" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#9CC3FF"/><stop offset="1" stop-color="#0065DF"/></linearGradient>` +
    `</defs>` +
    `<rect width="70" height="70" rx="18" fill="#15171C"/>` +
    `<rect width="70" height="70" rx="18" fill="url(#b-i-glow)"/>` +
    `<rect width="70" height="70" rx="18" fill="url(#b-i-fill)"/>` +
    `<rect x=".75" y=".75" width="68.5" height="68.5" rx="17.25" fill="none" stroke="url(#b-i-edge)" stroke-width="1.5"/>` +
    // frosted browser window
    `<rect x="12" y="22" width="30" height="26" rx="5" fill="#fff" fill-opacity=".12" stroke="#FEFEFE" stroke-width="1.6"/>` +
    `<path d="M12 28.5h30" stroke="#FEFEFE" stroke-opacity=".55" stroke-width="1.6"/>` +
    `<circle cx="16.5" cy="25.3" r="1.1" fill="#FEFEFE"/><circle cx="20" cy="25.3" r="1.1" fill="#FEFEFE" opacity=".5"/>` +
    `<rect x="17" y="33" width="8" height="8" rx="2" fill="#4F94FF"/>` +
    `<rect x="28" y="33.5" width="9" height="3" rx="1.5" fill="#FEFEFE" opacity=".7"/><rect x="28" y="39" width="6" height="3" rx="1.5" fill="#FEFEFE" opacity=".35"/>` +
    // reach arcs
    `<path d="M46 30.5a6.5 6.5 0 0 1 0 9M50 26a13 13 0 0 1 0 18" fill="none" stroke="url(#b-i-arc)" stroke-width="2" stroke-linecap="round"/>` +
    `<circle cx="58" cy="23.5" r="3" fill="#FEFEFE"/><circle cx="60.5" cy="35" r="3" fill="#4F94FF"/><circle cx="58" cy="46.5" r="3" fill="#FEFEFE"/>`;
  return svg(70, 70, body);
}
