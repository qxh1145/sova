// P3 — clay icon family: service benefit icons (I4), About goals (I5), pricing (I2, I3).
// Benefit icons sit on a full-bleed Sova tile; About goals and plan icons are free-standing
// objects on the dark page. Every icon is drawn in a design space and scaled to the intrinsic
// size of the file it replaces (see lib/icon.mjs).
import { clayIcon, star, sparkle, heart, arc, rot } from '../lib/icon.mjs';

const U = 'wp-content/uploads';

// ------------------------------------------------------------ shared pieces (70-unit tile space)
const tileIcon = (w, h, draw, extra = {}) => () =>
  clayIcon({ w, h, vw: 70, vh: 70, drop: 'tile', ...extra }, (k) => k.tile() + draw(k));

/** cream phone, tilted, with a mist screen; `screen(k)` draws onto the screen (x 25–45, y 16–52) */
const phone = (k, screen = () => '', tilt = -8) =>
  rot(
    tilt,
    35,
    35,
    k.R(22, 9, 26, 52, 7.5, 'w', 'd') +
      k.R(25, 15, 20, 39, 4, 's') +
      k.R(31, 11.3, 8, 1.8, 0.9, '#9AA9C9') +
      screen(k),
  );

// ------------------------------------------------------------ I4 website (70 × 70)
const website = [
  // Tiếp cận thêm khách hàng — a storefront browser broadcasting to customers
  (k) =>
    k.R(11, 20, 32, 28, 7, 'w', 'c') +
    k.C(17, 26, 2, 'k') + k.C(22.5, 26, 2, 'y') + k.C(28, 26, 2, 'm') +
    k.R(16, 32, 10, 10, 3, 'k', 'c') +
    k.R(29, 33, 9, 3.4, 1.7, '#B5C6EA') + k.R(29, 38.5, 6, 3.4, 1.7, '#B5C6EA') +
    k.S('M47 29.5a7 7 0 0 1 0 10M51 25a13 13 0 0 1 0 19', 'w', 3, 'c') +
    k.B(59, 22.5, 3.6, 'y', 'c') + k.B(61.5, 35, 3.6, 'k', 'c') + k.B(59, 47.5, 3.6, 'm', 'c'),
  // Quảng cáo hiệu quả hơn — megaphone
  (k) =>
    rot(-14, 33, 36,
      k.R(20, 41, 7, 13, 3.5, 'k', 'c') +
      k.P('M17 29.5 41 19.5c2.3-1 4.5.7 4.5 3.2v24.6c0 2.5-2.2 4.2-4.5 3.2L17 40.5c-2-.8-3-2.4-3-4.5v-2c0-2.1 1-3.7 3-4.5z', 'w', 'd') +
      k.E(45.5, 35, 4.2, 13.2, 'k', 'c') +
      k.R(10, 30, 7, 10, 3, 'y', 'c')) +
    k.S('M52 27.5a8.5 8.5 0 0 1 2.5 9.5M55.8 21.5a16 16 0 0 1 4.8 17.5', 'w', 3, 'c') +
    k.soft(star(57, 13, 5.2, 2.5), 'y', 1.6, 'c') +
    k.B(57, 54, 3.4, 'm', 'c'),
  // Củng cố thương hiệu — a shield carrying a star
  (k) =>
    k.P('M35 11.5 52.5 17.6c1 .4 1.6 1.3 1.6 2.4V33c0 11.3-7.6 19.4-18.2 23.6a2.6 2.6 0 0 1-1.8 0C23.5 52.4 15.9 44.3 15.9 33V20c0-1.1.6-2 1.6-2.4z', 'w', 'd') +
    k.P('M35 18 47.5 22.4V33c0 7.9-5 13.8-12.5 17.2C27.5 46.8 22.5 40.9 22.5 33V22.4z', 'l', 'a') +
    k.soft(star(35, 33.5, 8.6, 3.9), 'y', 2, 'c') +
    k.B(12.5, 50, 3.4, 'k', 'c') + k.B(58.5, 16, 3, 'm', 'c') +
    k.P(sparkle(59, 50, 5), '#fff', '', ' opacity=".85"'),
  // Phục vụ khách hàng 24/7 — a chat bubble that never sleeps (clock badge)
  (k) =>
    k.P('M21 13h18a9 9 0 0 1 9 9v9a9 9 0 0 1-9 9h-9.5l-8.6 7.2c-.8.7-1.9.1-1.9-.9v-6.9A9 9 0 0 1 12 31v-9a9 9 0 0 1 9-9z', 'w', 'd') +
    k.C(22, 26.5, 2.7, 'b') + k.C(30, 26.5, 2.7, 'b') + k.C(38, 26.5, 2.7, 'b') +
    k.C(48.5, 47.5, 12.5, 'y', 'd') +
    k.C(48.5, 47.5, 8.6, 'w', 'a') +
    k.S('M48.5 42.2v5.6l3.8 2.4', '#3B4768', 2.4) +
    k.C(48.5, 47.8, 1.3, '#3B4768') +
    k.B(60.5, 13, 3.4, 'k', 'c') + k.B(8.5, 54.5, 2.8, 'm', 'c'),
];

// ------------------------------------------------------------ I4 mobile (512 × 512, drawn at 70)
const mobile = [
  // Nâng vị thế thương hiệu — a phone crowned with a star badge
  (k) =>
    phone(k, (k) => k.R(28, 38, 4, 10, 1.5, 'v', 'a') + k.R(33, 33, 4, 15, 1.5, 'l', 'a') + k.R(38, 27, 4, 21, 1.5, 'k', 'a')) +
    k.C(50, 19, 11.5, 'y', 'd') +
    k.soft(star(50, 19.3, 6.6, 3), 'w', 1.6, 'a') +
    k.P('M44.5 28.5 42 39l4.3-2.3 2.6 4.1 1.9-10.6zM55.5 28.5 58 39l-4.3-2.3-2.6 4.1-1.9-10.6z', 'k', 'a') +
    k.B(12, 48, 3.4, 'm', 'c') + k.P(sparkle(14, 18, 5), '#fff', '', ' opacity=".85"'),
  // Mở rộng tính năng — app tiles multiplying, with a plus badge
  (k) =>
    phone(k, (k) =>
      k.R(27.5, 19, 6.8, 6.8, 2.2, 'k', 'a') + k.R(36, 19, 6.8, 6.8, 2.2, 'y', 'a') +
      k.R(27.5, 27.5, 6.8, 6.8, 2.2, 'm', 'a') + k.R(36, 27.5, 6.8, 6.8, 2.2, 'v', 'a') +
      k.R(27.5, 37, 15.3, 3, 1.5, '#9AA9C9') + k.R(27.5, 42.5, 10, 3, 1.5, '#9AA9C9')) +
    k.R(46, 13, 12, 12, 3.6, 'c', 'c') +
    k.C(52.5, 48, 10.5, 'm', 'd') +
    k.S('M52.5 43v10M47.5 48h10', '#fff', 3.2) +
    k.B(12.5, 20, 3.2, 'k', 'c'),
  // Chuyển đổi cao hơn — a shopping bag lifted by an up arrow
  (k) =>
    phone(k, (k) => k.R(28, 20, 14, 10, 3, 'w', 'a') + k.R(28, 33, 14, 3, 1.5, '#9AA9C9') + k.R(28, 38.5, 9, 3, 1.5, '#9AA9C9') + k.R(28, 45, 14, 5, 2.5, 'b')) +
    k.S('M15.5 39v-3.5a5 5 0 0 1 10 0V39', 'w', 2.6) +
    k.R(9, 37, 23, 21, 5, 'k', 'd') +
    k.hl(14.5, 42, 3.4, 1.6) +
    k.C(52, 22, 10.5, 'm', 'd') +
    k.soft('M52 15.8l5.6 6h-3.4v6.3h-4.4v-6.3h-3.4z', 'w', 1.4) +
    k.B(57, 52, 3.4, 'y', 'c'),
  // Đo lường, quản trị — a dashboard donut and a control slider
  (k) =>
    phone(k, (k) =>
      `<circle cx="35" cy="28.5" r="7" stroke="#C7D2E8" stroke-width="4.2"/>` +
      k.S(arc(35, 28.5, 7, -90, 60), 'k', 4.2) + k.S(arc(35, 28.5, 7, 82, 168), 'y', 4.2) +
      k.R(27.5, 40, 15, 3, 1.5, '#9AA9C9') + k.R(27.5, 45.5, 10, 3, 1.5, '#9AA9C9')) +
    k.R(43, 41, 20, 14, 7, 'w', 'd') +
    k.R(46.5, 46.5, 13, 3, 1.5, '#B5C6EA') +
    k.C(55, 48, 4.4, 'b', 'a') +
    k.B(12, 18, 3.4, 'm', 'c') + k.B(13, 52, 2.6, 'v', 'c'),
];

// ------------------------------------------------------------ I4 SEO (80 × 81 and 62 × 62)
const seo = [
  // Thứ hạng Google ổn định, lâu dài — the top of the podium
  (k) =>
    k.R(11, 39, 16, 18, 4, 'v', 'd') +
    k.R(43, 44, 16, 13, 4, 'k', 'd') +
    k.R(26.5, 30, 17, 27, 4, 'w', 'd') +
    k.R(31.5, 35, 7, 3, 1.5, '#B5C6EA') +
    k.soft(star(35, 18.5, 8.2, 3.8), 'y', 2, 'd') +
    k.P(sparkle(55, 22, 4.6), '#fff', '', ' opacity=".85"') + k.B(14.5, 25, 3, 'm', 'c'),
  // SEO toàn diện Onpage lẫn Offpage — a page and its links
  (k) =>
    k.R(12, 11, 30, 38, 7, 'w', 'd') +
    k.R(17.5, 18, 15, 3.4, 1.7, 'k') + k.R(17.5, 25, 19, 3, 1.5, '#B5C6EA') + k.R(17.5, 30.5, 14, 3, 1.5, '#B5C6EA') + k.R(17.5, 36, 17, 3, 1.5, '#B5C6EA') +
    rot(-40, 47, 46,
      `<rect x="34.5" y="41" width="15" height="10" rx="5" stroke="${k.g('c')}" stroke-width="4.2"${k.f('c')}/>` +
      `<rect x="44.5" y="41" width="15" height="10" rx="5" stroke="${k.g('y')}" stroke-width="4.2"${k.f('c')}/>`) +
    k.B(57.5, 15, 3.4, 'm', 'c') + k.B(11.5, 57, 2.8, 'p', 'c'),
  // Theo dõi và báo cáo rõ ràng — a report card under a magnifier
  (k) =>
    k.R(10, 12, 40, 40, 8, 'w', 'd') +
    k.R(16, 18, 14, 3.2, 1.6, '#B5C6EA') +
    k.R(16.5, 35, 6, 11, 2, 'l', 'a') + k.R(25, 29, 6, 17, 2, 'v', 'a') + k.R(33.5, 24, 6, 22, 2, 'k', 'a') +
    k.S('M53 52.5l7.5 7.5', 'b', 6, 'c') +
    k.C(46, 45.5, 9, 'c', 'a') +
    `<circle cx="46" cy="45.5" r="10" stroke="${k.g('y')}" stroke-width="4.6"${k.f('c')}/>` +
    k.hl(42.5, 42, 3.2, 1.6, -35, 0.6) +
    k.B(58.5, 14, 3.2, 'm', 'c'),
  // Chuyên gia SEO có kinh nghiệm thực chiến — a rosette medal
  (k) =>
    k.P('M25 40 18 58l7.4-2.6 4 6.6 6-17z', 'k', 'c') +
    k.P('M45 40l7 18-7.4-2.6-4 6.6-6-17z', 'p', 'c') +
    k.soft(star(35, 31, 19, 16.2, 12), 'y', 2.6, 'd') +
    k.C(35, 31, 11.5, 'w', 'a') +
    k.soft(star(35, 31.6, 7, 3.2), 'b', 1.6, 'a') +
    k.B(12, 18, 3.2, 'm', 'c') + k.P(sparkle(58, 17, 4.8), '#fff', '', ' opacity=".85"'),
];

// ------------------------------------------------------------ I4 branding (own files)
const branding = [
  // Thấu hiểu văn hóa doanh nghiệp — the company, loved from the inside
  (k) =>
    k.R(39, 30, 17, 28, 4, 'v', 'd') +
    k.R(14, 17, 28, 41, 5, 'w', 'd') +
    [0, 1, 2].map((r) => k.R(19, 23 + r * 9, 7, 5, 1.6, '#B5C6EA') + k.R(30, 23 + r * 9, 7, 5, 1.6, '#B5C6EA')).join('') +
    k.R(24.5, 49, 7, 9, 2, 'b') +
    k.R(43, 36, 4, 4, 1.2, '#D9CFFF') + k.R(49, 36, 4, 4, 1.2, '#D9CFFF') + k.R(43, 43, 4, 4, 1.2, '#D9CFFF') + k.R(49, 43, 4, 4, 1.2, '#D9CFFF') +
    k.C(51, 19, 9.5, 'p', 'd') +
    k.P(heart(51, 19.6, 5), '#fff'),
  // Kiến tạo trải nghiệm doanh nghiệp — an interface, a click, a spark
  (k) =>
    k.R(10, 15, 42, 32, 7, 'w', 'd') +
    k.C(16, 21, 1.9, 'k') + k.C(21, 21, 1.9, 'y') + k.C(26, 21, 1.9, 'm') +
    k.R(15.5, 27, 13, 14, 3, 'v', 'a') + k.R(32, 28, 15, 3, 1.5, '#B5C6EA') + k.R(32, 34, 10, 3, 1.5, '#B5C6EA') +
    k.soft('M40 36 57 43.2 50 45.6 54.6 53.4 50.6 55.6 46 47.8 41.4 53.2z', 'y', 2.2, 'd') +
    k.P(sparkle(58, 15, 6.2), 'w', 'c') +
    k.B(12.5, 55, 3.2, 'k', 'c'),
  // Hoạch định chiến lược sản phẩm — a mapped route to the flag
  (k) =>
    k.R(9, 13, 46, 44, 9, 'w', 'd') +
    `<path d="M19 47c6-1 7-9 14-10s10-4 9-12" stroke="${k.g('b')}" stroke-width="2.8" stroke-linecap="round" stroke-dasharray="1 5.2"/>` +
    k.C(18.5, 47.5, 4.2, 'k', 'a') +
    k.S('M42 29V14', '#3B4768', 2.6) +
    k.soft('M43 14.2 54 18.6 43 23z', 'y', 1.8, 'c') +
    k.C(42, 29.5, 2.4, '#3B4768') +
    k.B(60, 50, 3.4, 'm', 'c') + k.P(sparkle(61, 32, 4.4), '#fff', '', ' opacity=".85"'),
  // Bồi đắp giá trị bền vững — a sprout that keeps growing
  (k) =>
    k.S('M35 44V27', 'm', 3.4) +
    k.soft('M35 31c-1-7-6.5-11-14-10.5.5 7.5 6 11.5 14 10.5z', 'm', 1, 'c') +
    k.soft('M35.6 25.5c1.8-7.3 7.6-10.8 15.2-9.2-1.4 7.4-7.6 11-15.2 9.2z', 'm', 1, 'c') +
    k.P('M20 42.5h30l-3.5 15.2a3 3 0 0 1-2.9 2.3H26.4a3 3 0 0 1-2.9-2.3z', 'k', 'd') +
    k.R(17.5, 40, 35, 7, 3.5, 'k', 'c') +
    k.soft(star(56, 22, 5.4, 2.5), 'y', 1.6, 'c') + k.B(14, 22, 3, 'c', 'c'),
];

// ------------------------------------------------------------ I5 About goals (free-standing)
const D = { drop: 'dark' };
const about = [
  // 01 Đón đầu thay đổi — surging ahead of the wave (150 × 150 shown at 100: drawn small)
  {
    name: 'Icon-Glass-1', w: 150, h: 150, vw: 106, vh: 106, png: true,
    draw: (k) =>
      k.P('M14 78c10-12 22-15 32-8 9 6 17 6 25-2 7-7 15-9 21-5v19a8 8 0 0 1-8 8H22a8 8 0 0 1-8-8z', 'c', 'd') +
      k.P('M14 86c11-8 21-9 30-3 8 5 16 5 24-1 8-6 16-7 24-3v10a8 8 0 0 1-8 8H22a8 8 0 0 1-8-8z', 'l', 'c') +
      k.S('M22 70C36 56 46 40 74 26', 'k', 11, 'd') +
      k.soft('M86 18 63 19.5l9.5 6.2 2.8 11.4z', 'k', 4, 'd') +
      k.soft(star(30, 30, 9, 4.2), 'y', 2.4, 'c') +
      k.B(88, 54, 5, 'v', 'c') + k.B(48, 16, 3.6, 'm', 'c'),
  },
  // 02 Tư duy giải pháp — two pieces that fit
  {
    name: 'Group-1000001804', w: 88, h: 82,
    draw: (k) =>
      k.P('M14 22a6 6 0 0 1 6-6h13a7.5 7.5 0 1 1 13 0h4a6 6 0 0 1 6 6v8a7.5 7.5 0 1 0 0 13v9a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6z', 'b', 'd') +
      rot(10, 62, 42, k.P('M50 36.5a7.5 7.5 0 1 0 0-13h8a6 6 0 0 1 6 6v5a7.5 7.5 0 1 1 13 0v9a6 6 0 0 1-6 6H56a6 6 0 0 1-6-6z', 'm', 'd')) +
      k.hl(23, 25, 5, 2.4) +
      k.P(sparkle(76, 16, 6.5), 'y', 'c') + k.B(14, 70, 3.6, 'k', 'c'),
  },
  // 03 Thấu hiểu nhờ lắng nghe — a conversation with a heart in it
  {
    name: 'Icon-Glass-3-e1708484005472', w: 96, h: 80, png: true,
    draw: (k) =>
      k.P('M24 12h30a11 11 0 0 1 11 11v14a11 11 0 0 1-11 11H37l-11 9c-1 .8-2.4.1-2.4-1.2V48A11 11 0 0 1 13 37V23a11 11 0 0 1 11-11z', 'w', 'd') +
      k.C(28, 30, 3.4, 'b') + k.C(39, 30, 3.4, 'b') + k.C(50, 30, 3.4, 'b') +
      k.P('M66 33h7a9 9 0 0 1 9 9v8a9 9 0 0 1-9 9h-1v6.5c0 1-1.1 1.6-1.9.9L62 59h-3a9 9 0 0 1-9-9v-2', 'p', 'd') +
      k.P(heart(68, 46.5, 5.4), '#fff') +
      k.S('M78 17a9 9 0 0 1 3 7M83 11a17 17 0 0 1 5 13', 'y', 3, 'c'),
  },
  // 04 Kết quả cụ thể — on target
  {
    name: 'Group-1000001805', w: 88, h: 83,
    draw: (k) =>
      k.C(40, 45, 29, 'k', 'd') + k.C(40, 45, 21, 'w', 'a') + k.C(40, 45, 13, 'k', 'a') + k.C(40, 45, 5.5, 'w', 'a') +
      k.S('M41 44 66 19', 'b', 4.6, 'c') +
      k.soft('M64 21 66 9.5l5 4.6 4.8-.4-.9 5.4 4.6 4.6-11.6 2z', 'y', 2, 'c') +
      k.B(77, 58, 3.6, 'm', 'c'),
  },
  // 05 Giữ chữ tín — a commitment, signed and sealed
  {
    name: 'Group-48095355', w: 92, h: 90, png: true,
    draw: (k) =>
      rot(-6, 40, 44,
        k.R(18, 12, 44, 58, 9, 'w', 'd') +
        k.R(26, 22, 22, 4, 2, 'b') + k.R(26, 31, 28, 3.4, 1.7, '#B5C6EA') + k.R(26, 39, 24, 3.4, 1.7, '#B5C6EA') + k.R(26, 47, 18, 3.4, 1.7, '#B5C6EA') +
        k.S('M26 59c4-4 6 2 9-1s5-3 8 0', 'v', 2.6)) +
      k.P('M58 62 54 80l6.4-2.6 3.6 5.6 3-14zM72 62l4 18-6.4-2.6-3.6 5.6-3-14z', 'k', 'c') +
      k.C(65, 57, 15, 'm', 'd') +
      k.S('M58.5 57.5 63 62l8.5-9', '#fff', 3.6) +
      k.P(sparkle(80, 22, 6), 'y', 'c'),
  },
  // 06 Đổi mới mỗi ngày — something new on every page of the calendar
  {
    name: 'Group-48095375', w: 96, h: 80, png: true,
    draw: (k) =>
      k.R(14, 16, 50, 52, 10, 'w', 'd') +
      k.P('M24 16h30a10 10 0 0 1 10 10v4H14v-4a10 10 0 0 1 10-10z', 'k', 'a') +
      k.R(24, 10, 5, 12, 2.5, 'v', 'c') + k.R(49, 10, 5, 12, 2.5, 'v', 'c') +
      [0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => k.R(21 + c * 10, 37 + r * 9, 6, 5, 1.8, r === 1 && c === 2 ? 'y' : '#C7D2E8', r === 1 && c === 2 ? 'a' : '')).join('')).join('') +
      k.P(sparkle(74, 24, 13), 'y', 'd') +
      k.P(sparkle(84, 48, 6), 'p', 'c') + k.B(70, 62, 3.6, 'c', 'c'),
  },
];

// ------------------------------------------------------------ I3 pricing (plan icons + tile)
/** one clay slab in an 86-unit space; tiers stack upward from the shared base line */
const slab = (k, i, col) => {
  const w = 64 - i * 12;
  const x = 43 - w / 2;
  const y = 64 - i * 17;
  return k.R(x, y, w, 15, 7.5, col, 'd') + `<rect x="${x + 7}" y="${y + 4}" width="${Math.round(w * 0.34)}" height="3.4" rx="1.7" fill="#fff" opacity=".55"/>`;
};
// `topY` is the top edge of the topper; the stack always spans x 11–75 and ends at y 79.
const plans = [
  { name: 'Glass-Left-1', w: 86, h: 86, tiers: ['b'], topY: 48.6, top: (k) => k.B(43, 54, 5.4, 'm', 'c') },
  { name: 'Group-1000001808', w: 82, h: 77, tiers: ['b', 'v'], topY: 31.6, top: (k) => k.B(43, 37, 5.4, 'y', 'c') },
  { name: 'Group-1000001809', w: 86, h: 83, tiers: ['b', 'v', 'k'], topY: 7.3, top: (k) => k.soft(star(43, 18, 9.5, 4.4), 'y', 2.4, 'd') },
];
// The card shows the icon in a 60 × 40 box, so a square file renders 40 px tall: scale each stack
// about its centre until its longer side fills 90 % of the 86-unit canvas.
const fit = (topY, body) => {
  const s = (86 * 0.9) / Math.max(64, 79 - topY);
  return `<g transform="translate(43 43) scale(${s.toFixed(3)}) translate(-43 ${-(topY + 79) / 2})">${body}</g>`;
};

// ------------------------------------------------------------ I2 check (20 × 20)
const check = () =>
  clayIcon({ w: 20, h: 20, vw: 40, vh: 40, drop: 'dark' }, (k) =>
    k.soft(star(20, 20, 18, 15.6, 12, -90), 'g', 2.6, 'c') +
    k.S('M12.5 20.5 17.8 25.8 28 15', '#fff', 4.2));

// ------------------------------------------------------------ outputs
const svg = { format: 'svg' };
export const images = [
  ...['benefit-icon-1', 'benefit-icon-2', 'Icon-benefit', 'Icon-benefit-1'].map((f, i) => ({
    id: `i4-website-${i + 1}`, target: `${U}/2024/02/${f}.svg`, ...svg, svg: tileIcon(70, 70, website[i]),
  })),
  ...['brand-image', 'feature-selection', 'best-seller', 'user-experience'].map((f, i) => ({
    id: `i4-mobile-${i + 1}`, target: `${U}/2024/03/${f}.svg`, ...svg, svg: tileIcon(512, 512, mobile[i]),
  })),
  ...[['SEO', 80, 81], ['Group-1000001811', 62, 62], ['SEO-3', 80, 81], ['SEO-4', 80, 81]].map(([f, w, h], i) => ({
    id: `i4-seo-${i + 1}`, target: `${U}/2024/02/${f}.svg`, ...svg, svg: tileIcon(w, h, seo[i]),
  })),
  { id: 'i4-branding-1', target: `${U}/2024/03/teamwork.svg`, ...svg, svg: tileIcon(480, 480, branding[0], { wAttr: '480pt', hAttr: '480pt' }) },
  { id: 'i4-branding-2', target: `${U}/2024/03/good-rating.svg`, ...svg, svg: tileIcon(512, 512, branding[1]) },
  // SEO-3 / SEO-4 were shared with SEO; branding gets its own files
  { id: 'i4-branding-3', target: `${U}/2024/03/branding-strategy.svg`, replaces: null, ...svg, svg: tileIcon(80, 80, branding[2]) },
  { id: 'i4-branding-4', target: `${U}/2024/03/branding-value.svg`, replaces: null, ...svg, svg: tileIcon(80, 80, branding[3]) },
  ...about.map((a, i) => ({
    id: `i5-about-${i + 1}`,
    target: `${U}/2024/02/${a.name}.svg`,
    ...(a.png ? { replaces: `${U}/2024/02/${a.name}.png` } : {}),
    ...svg,
    svg: () => clayIcon({ w: a.w, h: a.h, vw: a.vw ?? a.w, vh: a.vh ?? a.h, ...D }, a.draw),
  })),
  ...plans.map((p, i) => ({
    id: `i3-plan-${i + 1}`, target: `${U}/2024/02/${p.name}.svg`, ...svg,
    svg: () => clayIcon({ w: p.w, h: p.h, vw: 86, vh: 86, ...D }, (k) => fit(p.topY, p.tiers.map((c, t) => slab(k, t, c)).join('') + p.top(k))),
  })),
  {
    id: 'i3-tile', target: `${U}/2024/02/Rectangle-1057.svg`, ...svg,
    // drawn 100 px wide in a 100 × 80 box (background-size: 100% auto), so only the top 97.6 of
    // 122 units show: the pad stops above the cut
    svg: () => clayIcon({ w: 122, h: 122, ...D }, (k) =>
      k.R(1, 1, 120, 94, 20, 'n', 'T') +
      `<rect x="1.5" y="1.5" width="119" height="93" rx="19.5" stroke="#4D95FF" stroke-opacity=".28"/>`),
  },
  { id: 'i2-check', target: `${U}/2024/02/Subtract.svg`, ...svg, svg: check },
];
