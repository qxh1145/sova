export interface LegalPreset {
  heroIds: {
    banner: string;
    textBox: string;
  };
  bodyIds: {
    row: string;
    col: string;
  };
  headingClass: string;
  emphasis: 'b' | 'strong';
  headingWrap?: {
    row: string;
    col: string;
  };
}

export const LEGAL_PRESETS: Record<string, LegalPreset> = {
  '/chinh-sach-bao-hanh/': {
    heroIds: { banner: 'banner-464754388', textBox: 'text-box-1484316664' },
    bodyIds: { row: 'row-1154179891', col: 'col-142673246' },
    headingClass: 'uppercase',
    emphasis: 'b',
  },
  '/chinh-sach-bao-mat/': {
    heroIds: { banner: 'banner-416480950', textBox: 'text-box-1907648541' },
    bodyIds: { row: 'row-1732206548', col: 'col-354414389' },
    headingClass: 'uppercase wp-block-heading',
    emphasis: 'b',
  },
  '/chinh-sach-hoan-tien/': {
    heroIds: { banner: 'banner-1986838095', textBox: 'text-box-354472005' },
    bodyIds: { row: 'row-926550836', col: 'col-1030398824' },
    headingClass: 'uppercase',
    emphasis: 'b',
  },
  '/dieu-khoan-su-dung/': {
    heroIds: { banner: 'banner-1609135034', textBox: 'text-box-1419549716' },
    bodyIds: { row: 'row-1094082225', col: 'col-1066432452' },
    headingClass: 'uppercase',
    emphasis: 'strong',
    headingWrap: { row: 'row-1481550581', col: 'col-1808946518' },
  },
  '/en/warranty-policy/': {
    heroIds: { banner: 'banner-1801484915', textBox: 'text-box-1962295311' },
    bodyIds: { row: 'row-1415243888', col: 'col-1277161367' },
    headingClass: 'uppercase',
    emphasis: 'b',
  },
  '/en/privacy-policy/': {
    heroIds: { banner: 'banner-1982495004', textBox: 'text-box-974847799' },
    bodyIds: { row: 'row-85491159', col: 'col-1398670656' },
    headingClass: 'uppercase wp-block-heading',
    emphasis: 'b',
  },
  '/en/refund-policy/': {
    heroIds: { banner: 'banner-897843043', textBox: 'text-box-272587465' },
    bodyIds: { row: 'row-433992554', col: 'col-2023793367' },
    headingClass: 'uppercase',
    emphasis: 'b',
  },
  '/en/terms-of-use/': {
    heroIds: { banner: 'banner-391064789', textBox: 'text-box-2039240272' },
    bodyIds: { row: 'row-1212102173', col: 'col-788601550' },
    headingClass: 'uppercase',
    emphasis: 'strong',
    headingWrap: { row: 'row-1701617476', col: 'col-1896608001' },
  },
};

export function getLegalPreset(path: string): LegalPreset {
  const normalized = path.endsWith('/') ? path : `${path}/`;
  const preset = LEGAL_PRESETS[normalized];
  if (!preset) {
    throw new Error(`Missing legal preset for path: ${path}`);
  }
  return preset;
}
