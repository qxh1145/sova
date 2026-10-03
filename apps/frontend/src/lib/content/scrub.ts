// Eras contact values -> `{{site.x}}` tokens, resolved from SiteSettings by lib/queries/tokens.ts.
// Runs before the brand map: the emails contain "erasvietnam". No path aliases (Node loads this).

/** Raw Eras contact values (documentation + the post-build grep via SCRUB_RULES). */
export const ERAS_CONTACTS = {
  phone: '0988606539',
  emails: ['info@erasvietnam.vn', 'support@erasvietnam.vn', 'contact@erasvietnam.vn'],
  domain: 'erasvietnam.vn',
  addresses: [
    'Số 33 Ngõ 165 Đường Cầu Giấy, Hà Nội, Việt Nam',
    'No. 33, Alley 165 Cau Giay Street, Cau Giay Ward, Hanoi City, Vietnam',
  ],
  messenger: 'm.me/103667724916938',
  zalo: 'zalo.me/0988606539',
};

const PHONE = String.raw`(?<!\d)(?:\(\+84\)\s?|\+84\s?|84)?0?988[.\s]?606[.\s]?539(?!\d)`;
const EMAIL = String.raw`(?:info|support|contact)@erasvietnam\.vn`;

/** Order matters: links before the bare phone/email they contain. */
export const SCRUB_RULES: [pattern: RegExp, token: string][] = [
  [/(?:https?:\/\/)?(?:www\.)?zalo\.me\/(?:84|0)?988606539/gi, '{{site.zaloHref}}'],
  [/(?:https?:\/\/)?(?:www\.)?m\.me\/103667724916938/gi, '{{site.messengerHref}}'],
  [new RegExp(String.raw`tel:\s*${PHONE}`, 'gi'), '{{site.phoneHref}}'],
  [new RegExp(`mailto:${EMAIL}`, 'gi'), 'mailto:{{site.email}}'],
  [new RegExp(PHONE, 'g'), '{{site.phone}}'],
  [new RegExp(EMAIL, 'gi'), '{{site.email}}'],
  [
    /Số 33,? Ngõ 165,? (?:Đường )?Cầu Giấy,(?: Quận Cầu Giấy,)? Hà Nội,? Việt Nam/g,
    '{{site.address}}',
  ],
  [
    /No\. 33,? (?:Alley|Lane) 165,? Cau Giay Street,(?: Cau Giay (?:Ward|District),)? Hanoi(?: City)?,? Vietnam/g,
    '{{site.address}}',
  ],
  // The bare domain as text (e.g. "tên miền “erasvietnam.vn”"); URLs are left to rewriteEraLinks.
  [/(?<![\w/.@-])erasvietnam\.vn(?![\w/-])/gi, '{{site.domain}}'],
];

export function scrubContacts(text: string): { text: string; count: number } {
  let count = 0;
  const out = SCRUB_RULES.reduce(
    (acc, [pattern, token]) =>
      acc.replace(pattern, () => {
        count++;
        return token;
      }),
    text.normalize('NFC'),
  );
  return { text: out, count };
}
