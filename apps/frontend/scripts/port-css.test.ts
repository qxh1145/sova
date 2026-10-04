import { expect, test } from 'vitest';
import { transformCss } from './port-css.ts';

const CHILD = '/wp-content/themes/flatsome-child/style.css';

test('rebases relative and Eras-host urls to root-absolute paths', () => {
  const { css, transforms } = transformCss(
    `a{background:url("../../uploads/x.png")}` +
      `b{background:url(https://erasvietnam.vn/wp-content/uploads/y__q_1.png)}` +
      `c{background:url('https://theme.erasvietnam.vn/wp-content/z.svg')}` +
      `d{background:url("data:image/png;base64,AA==")}`,
    CHILD,
  );
  expect(css).toBe(
    `a{background:url("/wp-content/uploads/x.png")}` +
      `b{background:url(/wp-content/uploads/y__q_1.png)}` +
      `c{background:url('/wp-content/z.svg')}` +
      `d{background:url("data:image/png;base64,AA==")}`,
  );
  expect(transforms).toEqual({ 'url-rebase': 3 });
});

test('logo-eras and non-Eras external urls become none', () => {
  const { css, transforms } = transformCss(
    `a{background:url("../../uploads/2025/04/logo-eras-3.svg") no-repeat}` +
      `b{background-image:url(https://example.com/bg.svg)}`,
    CHILD,
  );
  expect(css).toBe(`a{background:none no-repeat}b{background-image:none}`);
  expect(transforms).toEqual({ 'url-none': 2 });
});

test('/wp-includes/ urls become none (never copied)', () => {
  const { css, transforms } = transformCss(
    `a{background:url("../../../../wp-includes/js/mediaelement/mejs-controls.svg")}` +
      `b{background:url(/wp-includes/images/x.png)}`,
    CHILD,
  );
  expect(css).toBe(`a{background:none}b{background:none}`);
  expect(transforms).toEqual({ 'url-none': 2 });
});

test('drops webfont @font-face and font-host @import, keeps icon fonts', () => {
  const input =
    `@import url("https://fonts.googleapis.com/css2?family=Moul&wght@0;1&display=swap");` +
    `@font-face{font-family:'FZPoppins';src:url("wp-content/fonts/a.ttf")}` +
    `@font-face { font-family: "fl-icons"; src: url("wp-content/themes/flatsome/assets/css/icons/fl-icons.eot#iefix?v=1"); }` +
    `@font-face{font-family:dearflip;src:url("data:application/x-font-ttf;base64,AA==")}`;
  const { css, transforms } = transformCss(input, '/index.html');
  expect(css).toBe(
    `@font-face { font-family: "fl-icons"; src: url("/wp-content/themes/flatsome/assets/css/icons/fl-icons.eot#iefix?v=1"); }` +
      `@font-face{font-family:dearflip;src:url("data:application/x-font-ttf;base64,AA==")}`,
  );
  expect(transforms).toEqual({ 'font-import-removed': 1, 'font-face-removed': 1, 'url-rebase': 1 });
});

test('maps source text faces to font tokens, keeping !important', () => {
  const { css, transforms } = transformCss(
    `body{font-family: 'SF Pro Display', sans-serif!important}` +
      `p{font-family: Lato, sans-serif;}` +
      `q{font-family: 'FZPoppins', -apple-system, Roboto, Arial, sans-serif !important;}` +
      `r{font-family:'Roboto',sans-serif,Arial}` +
      `.kanit-font{font-family: 'Kanit'!important\n}` +
      `s{font-family: Moul, sans-serif}` +
      `i{font-family: fl-icons !important}` +
      `t{font-family:dearflip}u{font-family:sans-serif}v{--wp--preset--font-family--lato:Lato}`,
    CHILD,
  );
  expect(css).toBe(
    `body{font-family: var(--font-body)!important}` +
      `p{font-family: var(--font-body);}` +
      `q{font-family: var(--font-body) !important;}` +
      `r{font-family:var(--font-body)}` +
      `.kanit-font{font-family: var(--font-display)!important\n}` +
      `s{font-family: var(--font-alt)}` +
      `i{font-family: fl-icons !important}` +
      `t{font-family:dearflip}u{font-family:sans-serif}v{--wp--preset--font-family--lato:Lato}`,
  );
  expect(transforms).toEqual({ 'font-family-token': 6 });
});

test('leaves comments alone', () => {
  const input = `/* background: url("https://example.com/x.svg"); font-family: Lato */a{color:red}`;
  expect(transformCss(input, CHILD)).toEqual({ css: input, transforms: {} });
});

test('comments out a stray top-level } with the rule browsers swallow after it', () => {
  const { css, transforms } = transformCss(`a{color:red}\n}\n.x img{top:0;}\nb{color:blue}`, CHILD);
  expect(css).toBe(
    `a{color:red}\n/* port:css dropped (browsers drop it too): }\n.x img{top:0;} */\nb{color:blue}`,
  );
  expect(transforms).toEqual({ 'parse-error-dropped': 1 });
});
