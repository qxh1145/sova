import { HTMLElement } from 'node-html-parser';
import type { AssetRegistry } from '../assets.ts';
import type { LoginFormContent, Locale, RichContent, SEO } from '../../../src/types/content.ts';
import { processHref, processText, sanitize, type Stats } from '../html.ts';
import { trimBreaks } from '../services.ts';
import { hooks, must, rich, RICH_ALLOWED, seoOf, type Page } from './shared.ts';

export function thankYou(page: Page, registry: AssetRegistry, stats: Stats) {
  const inner = must(page.root.querySelector('#content .form_tke .col-inner'), page, 'message');
  const line = page.lineOf(inner.range[0]);
  return {
    id: `thank-you-${page.route.locale}`,
    seo: seoOf(page, registry, stats),
    body: rich(
      trimBreaks(sanitize(inner, hooks(page, line, stats), new Set([...RICH_ALLOWED, 'h1']))),
      [{ file: page.file, line }],
    ),
  };
}

export function sample(page: Page, registry: AssetRegistry, stats: Stats) {
  const content = must(page.root.querySelector('#content'), page, '#content');
  const line = page.lineOf(content.range[0]);
  return {
    id: `sample-${page.route.locale}`,
    seo: seoOf(page, registry, stats),
    body: rich(
      trimBreaks(
        sanitize(content, hooks(page, line, stats), new Set([...RICH_ALLOWED, 'blockquote'])),
      ),
      [{ file: page.file, line }],
    ),
  };
}

export const LOGIN_MESSAGES: Record<
  Locale,
  { usernameRequired: string; passwordRequired: string }
> = {
  vi: {
    usernameRequired: 'Lỗi: Trường tên người dùng đang trống.',
    passwordRequired: 'Lỗi: Mục mật khẩu đang trống.',
  },
  en: {
    usernameRequired: 'Error: The username field is empty.',
    passwordRequired: 'Error: The password field is empty.',
  },
};

export function login(
  page: Page,
  registry: AssetRegistry,
  stats: Stats,
): {
  id: string;
  seo: SEO;
  body: RichContent;
  login: LoginFormContent;
} {
  const inner = must(
    page.root.querySelector('.short-info .col-inner'),
    page,
    '.short-info .col-inner',
  );
  const line = page.lineOf(inner.range[0]);

  const logo = inner.querySelector('#logo');
  if (logo) logo.remove();

  const body = rich(
    trimBreaks(
      sanitize(
        inner,
        { ...hooks(page, line, stats), keepClass: true },
        new Set([...RICH_ALLOWED, 'i', 'div']),
      ),
    ),
    [{ file: page.file, line }],
  );

  const formEl = must(page.root.querySelector('#loginform'), page, '#loginform');
  const heading = processText(
    must(formEl.querySelector('h1'), page, 'login heading').text.trim(),
    stats,
  );

  const registerA = must(formEl.querySelector('a[href*="action=register"]'), page, 'register link');
  const registerText = processText(registerA.text.trim(), stats);
  const registerHref = must(
    processHref(registerA.getAttribute('href') ?? '', page.file, line, stats),
    page,
    'register href',
  );
  const registerParent = must(registerA.parentNode, page, 'register link parent');
  const noAccountText = processText(
    registerParent.childNodes
      .filter((n) => n !== registerA)
      .map((n) => n.text)
      .join('')
      .trim(),
    stats,
  );

  const loginInput = must(formEl.querySelector('#user_login'), page, '#user_login');
  const usernamePlaceholder = processText(
    must(loginInput.getAttribute('placeholder'), page, 'user_login placeholder'),
    stats,
  ).trim();

  const passInput = must(formEl.querySelector('#user_pass'), page, '#user_pass');
  const passwordPlaceholder = processText(
    must(passInput.getAttribute('placeholder'), page, 'user_pass placeholder'),
    stats,
  ).trim();

  const sourceText = must(page.source, page, 'page.source');
  const hideMatch = must(
    /"Hide password":\s*\["([^"]+)"\]/.exec(sourceText),
    page,
    'hide password l10n',
  );
  const showMatch = must(
    /"Show password":\s*\["([^"]+)"\]/.exec(sourceText),
    page,
    'show password l10n',
  );
  const hidePasswordLabel = JSON.parse(`"${hideMatch[1]}"`) as string;
  const showPasswordLabel = JSON.parse(`"${showMatch[1]}"`) as string;

  const rememberLabelEl = must(
    formEl.querySelector('label[for="rememberme"]'),
    page,
    'rememberme label',
  );
  const rememberLabel = processText(rememberLabelEl.text.trim(), stats);

  const lostA = must(formEl.querySelector('a.wp-login-lost-password'), page, 'lost password link');
  const lostPasswordText = processText(lostA.text.trim(), stats);
  const lostPasswordHref = must(
    processHref(lostA.getAttribute('href') ?? '', page.file, line, stats),
    page,
    'lost password href',
  );

  const submitInput = must(formEl.querySelector('#wp-submit'), page, '#wp-submit');
  const submitLabel = processText(
    must(submitInput.getAttribute('value'), page, 'wp-submit value'),
    stats,
  ).trim();

  const privacyA = must(page.root.querySelector('a.privacy-policy-link'), page, 'privacy link');
  const privacyText = processText(privacyA.text.trim(), stats);
  const privacyHref = must(
    processHref(privacyA.getAttribute('href') ?? '', page.file, line, stats),
    page,
    'privacy href',
  );

  const messages = LOGIN_MESSAGES[page.route.locale];

  return {
    id: `login-${page.route.locale}`,
    seo: seoOf(page, registry, stats),
    body,
    login: {
      heading,
      noAccountText,
      registerText,
      registerHref,
      usernamePlaceholder,
      passwordPlaceholder,
      showPasswordLabel,
      hidePasswordLabel,
      rememberLabel,
      lostPasswordText,
      lostPasswordHref,
      submitLabel,
      privacyText,
      privacyHref,
      usernameRequired: messages.usernameRequired,
      passwordRequired: messages.passwordRequired,
    },
  };
}
