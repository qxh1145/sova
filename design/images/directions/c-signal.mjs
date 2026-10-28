// Direction C — "Signal": a bundle of light-trace lines that pinches, then fans out to endpoints.
import { svg, n, grainDefs, grainRect, bez, cubicPath } from '../lib/svg.mjs';

export const meta = {
  id: 'c-signal',
  name: 'Signal',
  palette: {
    base: '#08090B',
    deep: '#001A3D',
    primary: '#0065DF',
    primaryLight: '#4D9BFF',
    core: '#CFE2FF',
    cyan: '#19C3E6',
  },
};

const W = 2000;
const H = 900;

// Lines rise from below the frame (wide), pass a waist near (1560, 470), then fan
// out to a column of endpoints on the right. Nothing enters x < 1300 (mobile strip).
function ribbon() {
  const N = 28;
  const lines = [];
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const p0 = [1320 + 360 * t, 960];
    const p1 = [1430 + 90 * t, 650 - 30 * t];
    const p2 = [1590 + 40 * t, 440 - 20 * t];
    const p3 = [1846, 160 + 480 * t];
    lines.push({ t, p: [p0, p1, p2, p3], d: cubicPath(p0, p1, p2, p3) });
  }
  const fade = (t) => 0.16 + 0.44 * Math.pow(Math.sin(Math.PI * t), 1.4);
  let glow = '';
  let core = '';
  let pulses = '';
  let ends = '';
  lines.forEach(({ t, p, d }, i) => {
    core += `<path d="${d}" stroke="url(#c-line)" stroke-opacity="${n(fade(t), 2)}" stroke-width="${i % 4 === 0 ? 1.6 : 1.1}"/>`;
    if (i % 2 === 0) glow += `<path d="${d}" stroke="#0065DF" stroke-width="6"/>`;
    if ([6, 13, 20].includes(i)) {
      pulses += `<path d="${d}" stroke="#BFD8FF" stroke-width="2" stroke-dasharray="46 3000" stroke-dashoffset="-${[520, 610, 470][[6, 13, 20].indexOf(i)]}" stroke-linecap="round" opacity=".85"/>`;
    }
    if (i % 3 === 1) {
      const [x, y] = p[3];
      const lit = i === 13;
      ends += `<circle cx="${n(x)}" cy="${n(y)}" r="${lit ? 14 : 9}" fill="#0065DF" opacity="${lit ? 0.55 : 0.3}" filter="url(#c-soft)"/>`;
      ends += `<circle cx="${n(x)}" cy="${n(y)}" r="${lit ? 4 : 2.8}" fill="${lit ? '#19C3E6' : '#CFE2FF'}" opacity="${lit ? 1 : 0.8}"/>`;
    }
  });
  // the waist, where the bundle is densest
  const [wx, wy] = bez(...lines[14].p, 0.62);
  return (
    `<ellipse cx="${n(wx)}" cy="${n(wy)}" rx="120" ry="160" fill="#0065DF" opacity=".22" filter="url(#c-haze)"/>` +
    `<g fill="none" filter="url(#c-glow)" opacity=".28">${glow}</g>` +
    `<g fill="none">${core}</g>` +
    `<g fill="none" filter="url(#c-pulse)">${pulses}</g>` +
    ends
  );
}

export function h3() {
  const defs =
    `<defs>` +
    `<linearGradient id="c-base" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#08090B"/><stop offset=".6" stop-color="#08090B"/><stop offset="1" stop-color="#0A0C10"/></linearGradient>` +
    `<linearGradient id="c-line" x1="1400" y1="900" x2="1880" y2="300" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0065DF" stop-opacity="0"/><stop offset=".3" stop-color="#0065DF"/><stop offset=".75" stop-color="#4D9BFF"/><stop offset="1" stop-color="#8FC0FF"/></linearGradient>` +
    `<filter id="c-glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="12"/></filter>` +
    `<filter id="c-pulse" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` +
    `<filter id="c-soft" x="-1" y="-1" width="3" height="3"><feGaussianBlur stdDeviation="5"/></filter>` +
    `<filter id="c-haze" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="80"/></filter>` +
    `<linearGradient id="c-floor" x1="0" y1="0" x2="0" y2="1"><stop offset=".8" stop-color="#121417" stop-opacity="0"/><stop offset="1" stop-color="#131518"/></linearGradient>` +
    `<pattern id="c-dots" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r=".9" fill="#4D9BFF" fill-opacity=".2"/></pattern>` +
    `<radialGradient id="c-dotMask" cx="1760" cy="720" r="420" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>` +
    `<mask id="c-dm" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="url(#c-dotMask)"/></mask>` +
    grainDefs('c-grain', { seed: 3 }) +
    `</defs>`;

  const body =
    defs +
    `<rect width="${W}" height="${H}" fill="url(#c-base)"/>` +
    // low horizon glow on the right
    `<g filter="url(#c-haze)"><ellipse cx="1760" cy="860" rx="420" ry="170" fill="#0065DF" opacity=".4"/></g>` +
    `<rect x="1300" y="380" width="700" height="520" fill="url(#c-dots)" mask="url(#c-dm)"/>` +
    ribbon() +
    `<rect width="${W}" height="${H}" fill="url(#c-floor)"/>` +
    grainRect('c-grain', W, H, 0.05, 'c-dm');

  return svg(W, H, body);
}

// I4 sample — a window whose signal line flows out and fans to three people.
export function i4() {
  const body =
    `<defs>` +
    `<linearGradient id="c-i-hz" x1="0" y1="70" x2="0" y2="38" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0065DF" stop-opacity=".32"/><stop offset="1" stop-color="#0065DF" stop-opacity="0"/></linearGradient>` +
    `<linearGradient id="c-i-line" x1="30" y1="0" x2="58" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0065DF"/><stop offset="1" stop-color="#4D9BFF"/></linearGradient>` +
    `</defs>` +
    `<rect width="70" height="70" rx="20" fill="#0D0F12"/>` +
    `<rect width="70" height="70" rx="20" fill="url(#c-i-hz)"/>` +
    `<rect x=".5" y=".5" width="69" height="69" rx="19.5" fill="none" stroke="#fff" stroke-opacity=".08"/>` +
    `<g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2">` +
    `<rect x="10" y="22" width="27" height="25" rx="4" stroke="#FEFEFE"/>` +
    `<path d="M10 28h27" stroke="#FEFEFE" stroke-opacity=".55"/>` +
    // signal leaves the window and fans out
    `<path d="M23 37.5h9c7 0 8-14 16-14h6M32 37.5h22M32 37.5c7 0 8 13 16 13h6" stroke="url(#c-i-line)"/>` +
    `</g>` +
    `<circle cx="14.2" cy="25" r="1" fill="#FEFEFE"/><circle cx="17.4" cy="25" r="1" fill="#FEFEFE" opacity=".5"/>` +
    `<circle cx="23" cy="37.5" r="2.6" fill="#FEFEFE"/>` +
    `<circle cx="58" cy="23.5" r="3" fill="#CFE2FF"/><circle cx="58" cy="37.5" r="3" fill="#19C3E6"/><circle cx="58" cy="50.5" r="3" fill="#CFE2FF"/>`;
  return svg(70, 70, body);
}
