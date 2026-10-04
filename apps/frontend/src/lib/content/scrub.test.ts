import { expect, test } from 'vitest';
import { applyBrandTerms } from './brand';
import { ERAS_CONTACTS, scrubContacts } from './scrub';

test.each([
  ['0988.606.539', '{{site.phone}}'],
  ['0988 606 539', '{{site.phone}}'],
  ['0988606539', '{{site.phone}}'],
  ['(+84) 988.606.539', '{{site.phone}}'],
  ['(+84) 988 606 539', '{{site.phone}}'],
  ['84988606539', '{{site.phone}}'],
  ['0988-606-539', '{{site.phone}}'],
  ['tel:0988-606-539', '{{site.phoneHref}}'],
  ['hotline: 0988.606.539.', 'hotline: {{site.phone}}.'],
  ['tel:0988606539', '{{site.phoneHref}}'],
  ['support@erasvietnam.vn', '{{site.email}}'],
  ['Info@erasvietnam.vn', '{{site.email}}'],
  ['mailto:support@erasvietnam.vn', 'mailto:{{site.email}}'],
  ['Số 33 Ngõ 165 Đường Cầu Giấy, Hà Nội, Việt Nam.', '{{site.address}}.'],
  ['Số 33 Ngõ 165 Cầu Giấy, Hà Nội, Việt Nam', '{{site.address}}'],
  ['No. 33, Alley 165 Cau Giay Street, Cau Giay Ward, Hanoi City, Vietnam', '{{site.address}}'],
  ['No. 33, Lane 165 Cau Giay Street, Hanoi, Vietnam.', '{{site.address}}.'],
  ['https://m.me/103667724916938', '{{site.messengerHref}}'],
  ['https://zalo.me/0988606539', '{{site.zaloHref}}'],
  ['https://zalo.me/84988606539', '{{site.zaloHref}}'],
  ['zalo://conversation?phone=0988606539', '{{site.zaloHref}}'],
  ['định dạng “…@erasvietnam.vn”', 'định dạng “…@{{site.domain}}”'],
  ['tên miền “erasvietnam.vn”', 'tên miền “{{site.domain}}”'],
  ['www.erasvietnam.vn', '{{site.domain}}'],
  ['erasvietnam.com', '{{site.domain}}'],
  ['Website: www.erasvietnam.com.', 'Website: {{site.domain}}.'],
  ['https://erasvietnam.vn/x/', 'https://erasvietnam.vn/x/'],
  ['10988606539 and 09886065390', '10988606539 and 09886065390'],
])('scrubContacts(%j)', (input, expected) => {
  expect(scrubContacts(input).text).toBe(expected);
});

test('scrub runs before the brand map so emails do not become Sova fragments', () => {
  const text = 'Eras Việt Nam: support@erasvietnam.vn, 0988.606.539';
  expect(applyBrandTerms(scrubContacts(text).text).text).toBe(
    'Sova: {{site.email}}, {{site.phone}}',
  );
});

test('every raw contact value is scrubbed', () => {
  const values = [
    ERAS_CONTACTS.phone,
    ERAS_CONTACTS.domain,
    ERAS_CONTACTS.messenger,
    ERAS_CONTACTS.zalo,
    ...ERAS_CONTACTS.emails,
    ...ERAS_CONTACTS.addresses,
  ];
  for (const value of values) expect(scrubContacts(value).text).toMatch(/^\{\{site\.\w+\}\}$/);
});
