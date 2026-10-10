/* eslint-disable @next/next/no-img-element */
import { Fragment } from 'react';
import type { AssetRef, Locale, SectionCopy, Testimonial } from '@/types/content';
import { Carousel, type CarouselLabels } from '@/components/ui/Carousel';
import { TestimonialCard, type TestimonialSlideIds } from './TestimonialCard';

export interface TestimonialsArt {
  photo: AssetRef;
  quoteIcon: AssetRef;
  line: AssetRef;
}

export interface TestimonialsIds {
  section: string;
  row: string;
  leftCol: string;
  imageWrapper: string;
  rightCol: string;
  eyebrowText?: string;
  titleText?: string;
  sliderWrapper: string;
  innerGap?: string;
  bottomGap?: string;
  slides?: TestimonialSlideIds[];
}

export const TESTIMONIALS_IDS_VI: TestimonialsIds = {
  section: 'section_1900032435',
  row: 'row-1068036605',
  leftCol: 'col-1079299922',
  imageWrapper: 'image_1870701100',
  rightCol: 'col-55011168',
  eyebrowText: 'text-355018751',
  titleText: 'text-4267280504',
  sliderWrapper: 'slider-1717467276',
  innerGap: 'gap-1197683257',
  bottomGap: 'gap-463933089',
  slides: [
    {
      row: 'row-14011233',
      col: 'col-1026990964',
      ndKh: 'text-1590618984',
      line: 'text-867299508',
      iconBoxText: 'text-210173545',
    },
    {
      row: 'row-693377910',
      col: 'col-1852668721',
      ndKh: 'text-1572294598',
      line: 'text-3700567653',
      iconBoxText: 'text-3120545540',
    },
    {
      row: 'row-2021009934',
      col: 'col-1650919536',
      ndKh: 'text-3909856715',
      line: 'text-1648463642',
      iconBoxText: 'text-2833241039',
    },
  ],
};

export const TESTIMONIALS_IDS_EN: TestimonialsIds = {
  section: 'section_1228410742',
  row: 'row-437563557',
  leftCol: 'col-1768254652',
  imageWrapper: 'image_1238961925',
  rightCol: 'col-863261912',
  eyebrowText: 'text-3668364895',
  titleText: 'text-3509530597',
  sliderWrapper: 'slider-283546209',
  innerGap: 'gap-962155070',
  bottomGap: 'gap-1944902466',
  slides: [
    {
      row: 'row-1450896083',
      col: 'col-993040111',
      ndKh: 'text-3287329704',
      line: 'text-4017882471',
      iconBoxText: 'text-1934524323',
    },
    {
      row: 'row-1154937134',
      col: 'col-471033680',
      ndKh: 'text-563581188',
      line: 'text-935327714',
      iconBoxText: 'text-2518450561',
    },
    {
      row: 'row-1376163772',
      col: 'col-92386505',
      ndKh: 'text-3819219461',
      line: 'text-3932566025',
      iconBoxText: 'text-493768455',
    },
  ],
};

export const TESTIMONIALS_IDS_MOBILE_VI: TestimonialsIds = {
  section: 'section_611504284',
  row: 'row-1744614563',
  leftCol: 'col-1209418902',
  imageWrapper: 'image_537706431',
  rightCol: 'col-747664916',
  eyebrowText: 'text-725286249',
  titleText: 'text-1488968211',
  sliderWrapper: 'slider-1746009011',
  innerGap: 'gap-1849267319',
  bottomGap: 'gap-1067076909',
  slides: [
    {
      row: 'row-315631769',
      col: 'col-818589815',
      ndKh: 'text-2744278447',
      line: 'text-2896139581',
      iconBoxText: 'text-2666594682',
    },
    {
      row: 'row-2024683135',
      col: 'col-644536123',
      ndKh: 'text-2009410189',
      line: 'text-1982626175',
      iconBoxText: 'text-780003339',
    },
    {
      row: 'row-1787779435',
      col: 'col-1215656760',
      ndKh: 'text-830958306',
      line: 'text-4161399947',
      iconBoxText: 'text-3716479530',
    },
  ],
};

export const TESTIMONIALS_IDS_MOBILE_EN: TestimonialsIds = {
  section: 'section_1896637792',
  row: 'row-920490087',
  leftCol: 'col-68456414',
  imageWrapper: 'image_1284626495',
  rightCol: 'col-975785863',
  eyebrowText: 'text-970536821',
  titleText: 'text-233220127',
  sliderWrapper: 'slider-2023647237',
  innerGap: 'gap-1942715701',
  bottomGap: 'gap-636789219',
  slides: [
    {
      row: 'row-2112378752',
      col: 'col-1978610518',
      ndKh: 'text-1663926344',
      line: 'text-2119023388',
      iconBoxText: 'text-1814777814',
    },
    {
      row: 'row-1342641053',
      col: 'col-1012808329',
      ndKh: 'text-509714514',
      line: 'text-1740085102',
      iconBoxText: 'text-2166651137',
    },
    {
      row: 'row-150274955',
      col: 'col-189619842',
      ndKh: 'text-2039104331',
      line: 'text-1163562078',
      iconBoxText: 'text-924829024',
    },
  ],
};

export const TESTIMONIALS_IDS_HOSTING_VI: TestimonialsIds = {
  section: 'section_601922759',
  row: 'row-1720812725',
  leftCol: 'col-105938061',
  imageWrapper: 'image_491749075',
  rightCol: 'col-2099560627',
  eyebrowText: 'text-1954659702',
  titleText: 'text-3104430940',
  sliderWrapper: 'slider-1185320468',
  innerGap: 'gap-1090470330',
  bottomGap: 'gap-967692151',
  slides: [
    {
      row: 'row-1942823748',
      col: 'col-834795930',
      ndKh: 'text-299155815',
      line: 'text-1320344294',
      iconBoxText: 'text-2514513466',
    },
    {
      row: 'row-2124158199',
      col: 'col-578982266',
      ndKh: 'text-1384824073',
      line: 'text-2710081290',
      iconBoxText: 'text-4022369665',
    },
    {
      row: 'row-1134616236',
      col: 'col-2106742537',
      ndKh: 'text-4273456082',
      line: 'text-333887419',
      iconBoxText: 'text-54875533',
    },
  ],
};

export const TESTIMONIALS_IDS_HOSTING_EN: TestimonialsIds = {
  section: 'section_1341923526',
  row: 'row-1540336113',
  leftCol: 'col-1557214775',
  imageWrapper: 'image_562855796',
  rightCol: 'col-913191646',
  eyebrowText: 'text-2549990629',
  titleText: 'text-2128609193',
  sliderWrapper: 'slider-1739765766',
  innerGap: 'gap-149198458',
  bottomGap: 'gap-1222585009',
  slides: [
    {
      row: 'row-807651528',
      col: 'col-1694578235',
      ndKh: 'text-4174658684',
      line: 'text-669744452',
      iconBoxText: 'text-3571552358',
    },
    {
      row: 'row-335117581',
      col: 'col-820976926',
      ndKh: 'text-34308129',
      line: 'text-3628057217',
      iconBoxText: 'text-3321225928',
    },
    {
      row: 'row-1186901178',
      col: 'col-1689791417',
      ndKh: 'text-290332767',
      line: 'text-1319123777',
      iconBoxText: 'text-3730226156',
    },
  ],
};

export const TESTIMONIALS_IDS_VPS_VI: TestimonialsIds = {
  section: 'section_2083222755',
  row: 'row-222827155',
  leftCol: 'col-1084059863',
  imageWrapper: 'image_633170927',
  rightCol: 'col-1978814024',
  eyebrowText: 'text-4111739786',
  titleText: 'text-41298809',
  sliderWrapper: 'slider-334457488',
  innerGap: 'gap-1191812962',
  bottomGap: 'gap-1337576045',
  slides: [
    {
      row: 'row-468083611',
      col: 'col-274249864',
      ndKh: 'text-2056376816',
      line: 'text-1296810078',
      iconBoxText: 'text-1695803420',
    },
    {
      row: 'row-1008910294',
      col: 'col-1959434119',
      ndKh: 'text-329473446',
      line: 'text-3371698953',
      iconBoxText: 'text-975750105',
    },
    {
      row: 'row-269230667',
      col: 'col-2070867829',
      ndKh: 'text-1444004264',
      line: 'text-3125855162',
      iconBoxText: 'text-4269981143',
    },
  ],
};

export const TESTIMONIALS_IDS_VPS_EN: TestimonialsIds = {
  section: 'section_1606797624',
  row: 'row-713008911',
  leftCol: 'col-928874526',
  imageWrapper: 'image_1147461546',
  rightCol: 'col-204491766',
  eyebrowText: 'text-2611397371',
  titleText: 'text-3815097734',
  sliderWrapper: 'slider-109060255',
  innerGap: 'gap-254895094',
  bottomGap: 'gap-1142588218',
  slides: [
    {
      row: 'row-794163630',
      col: 'col-1704419566',
      ndKh: 'text-300467739',
      line: 'text-2477984878',
      iconBoxText: 'text-4211171123',
    },
    {
      row: 'row-499480548',
      col: 'col-101226913',
      ndKh: 'text-1943462905',
      line: 'text-2193445836',
      iconBoxText: 'text-849972628',
    },
    {
      row: 'row-1131111854',
      col: 'col-255863287',
      ndKh: 'text-2464852430',
      line: 'text-1941871619',
      iconBoxText: 'text-2482240244',
    },
  ],
};

export const TESTIMONIALS_IDS_EMAIL_VI: TestimonialsIds = {
  section: 'section_1984183481',
  row: 'row-114143651',
  leftCol: 'col-1068355559',
  imageWrapper: 'image_331740629',
  rightCol: 'col-901618470',
  eyebrowText: 'text-3837946768',
  titleText: 'text-1298323406',
  sliderWrapper: 'slider-114261328',
  innerGap: 'gap-1424382467',
  bottomGap: 'gap-1531803359',
  slides: [
    {
      row: 'row-1206751867',
      col: 'col-794361294',
      ndKh: 'text-1628036239',
      line: 'text-1168134763',
      iconBoxText: 'text-2116874641',
    },
    {
      row: 'row-847301732',
      col: 'col-200154738',
      ndKh: 'text-1399452221',
      line: 'text-1476327395',
      iconBoxText: 'text-1917514466',
    },
    {
      row: 'row-68234570',
      col: 'col-249943998',
      ndKh: 'text-2113135161',
      line: 'text-1378018257',
      iconBoxText: 'text-3113930760',
    },
  ],
};

export const TESTIMONIALS_IDS_EMAIL_EN: TestimonialsIds = {
  section: 'section_2136010649',
  row: 'row-103329289',
  leftCol: 'col-1651344776',
  imageWrapper: 'image_412222799',
  rightCol: 'col-901269700',
  eyebrowText: 'text-3202874702',
  titleText: 'text-3557437193',
  sliderWrapper: 'slider-1505677085',
  innerGap: 'gap-37007440',
  bottomGap: 'gap-343316009',
  slides: [
    {
      row: 'row-1701249391',
      col: 'col-38225116',
      ndKh: 'text-4243389167',
      line: 'text-1571621388',
      iconBoxText: 'text-1622937273',
    },
    {
      row: 'row-1403061539',
      col: 'col-480395229',
      ndKh: 'text-358670330',
      line: 'text-706941177',
      iconBoxText: 'text-3720002696',
    },
    {
      row: 'row-673922830',
      col: 'col-1766384887',
      ndKh: 'text-159124821',
      line: 'text-2470805889',
      iconBoxText: 'text-1126978856',
    },
  ],
};

export const TESTIMONIALS_IDS_STORAGE_VI: TestimonialsIds = {
  section: 'section_1048537414',
  row: 'row-25758408',
  leftCol: 'col-843771208',
  imageWrapper: 'image_1272530354',
  rightCol: 'col-1996022406',
  eyebrowText: 'text-5758991',
  titleText: 'text-572381340',
  sliderWrapper: 'slider-1012747863',
  innerGap: 'gap-739066263',
  bottomGap: 'gap-1581933415',
  slides: [
    {
      row: 'row-165762780',
      col: 'col-392856623',
      ndKh: 'text-127529271',
      line: 'text-2992918654',
      iconBoxText: 'text-4205616960',
    },
    {
      row: 'row-1717395982',
      col: 'col-1185392647',
      ndKh: 'text-2783597054',
      line: 'text-1999390591',
      iconBoxText: 'text-76864968',
    },
    {
      row: 'row-945081940',
      col: 'col-1682012185',
      ndKh: 'text-3809134423',
      line: 'text-2218992351',
      iconBoxText: 'text-531156222',
    },
  ],
};

export const TESTIMONIALS_IDS_STORAGE_EN: TestimonialsIds = {
  section: 'section_2078920882',
  row: 'row-2111227539',
  leftCol: 'col-1919169037',
  imageWrapper: 'image_1214714786',
  rightCol: 'col-1460778604',
  eyebrowText: 'text-3882111148',
  titleText: 'text-167914798',
  sliderWrapper: 'slider-1592250510',
  innerGap: 'gap-1883425874',
  bottomGap: 'gap-1288694242',
  slides: [
    {
      row: 'row-489551706',
      col: 'col-220362461',
      ndKh: 'text-1489963960',
      line: 'text-2668653613',
      iconBoxText: 'text-3691187742',
    },
    {
      row: 'row-439442504',
      col: 'col-1137686727',
      ndKh: 'text-864123362',
      line: 'text-2885720343',
      iconBoxText: 'text-841831541',
    },
    {
      row: 'row-233250147',
      col: 'col-799590295',
      ndKh: 'text-3744976074',
      line: 'text-2703850797',
      iconBoxText: 'text-908824235',
    },
  ],
};

export const TESTIMONIALS_IDS_SEO_VI: TestimonialsIds = {
  section: 'section_994856196',
  row: 'row-1970142633',
  leftCol: 'col-1711411439',
  imageWrapper: 'image_226410370',
  rightCol: 'col-1780721471',
  eyebrowText: 'text-2545921122',
  titleText: 'text-2682744902',
  sliderWrapper: 'slider-1737935147',
  innerGap: 'gap-1174607928',
  bottomGap: 'gap-1770001486',
  slides: [
    {
      row: 'row-201912110',
      col: 'col-1422218239',
      ndKh: 'text-1500989031',
      line: 'text-1861750207',
      iconBoxText: 'text-362845868',
    },
    {
      row: 'row-441767941',
      col: 'col-2015959260',
      ndKh: 'text-127251427',
      line: 'text-76020626',
      iconBoxText: 'text-4040184306',
    },
    {
      row: 'row-117947924',
      col: 'col-2060848744',
      ndKh: 'text-3341570520',
      line: 'text-3593512825',
      iconBoxText: 'text-2142396922',
    },
  ],
};

export const TESTIMONIALS_IDS_SEO_EN: TestimonialsIds = {
  section: 'section_1195289173',
  row: 'row-1264708032',
  leftCol: 'col-1066307567',
  imageWrapper: 'image_774589482',
  rightCol: 'col-100487888',
  eyebrowText: 'text-4052832496',
  titleText: 'text-2352961773',
  sliderWrapper: 'slider-1314993687',
  innerGap: 'gap-1562903745',
  bottomGap: 'gap-1736897242',
  slides: [
    {
      row: 'row-824170992',
      col: 'col-303997285',
      ndKh: 'text-1018133355',
      line: 'text-2906925555',
      iconBoxText: 'text-296291827',
    },
    {
      row: 'row-1110032589',
      col: 'col-1207041402',
      ndKh: 'text-1646445185',
      line: 'text-809313361',
      iconBoxText: 'text-1110989631',
    },
    {
      row: 'row-1740293699',
      col: 'col-1704535054',
      ndKh: 'text-2332629546',
      line: 'text-700961503',
      iconBoxText: 'text-3849567950',
    },
  ],
};

export const TESTIMONIALS_IDS_BRANDING_VI: TestimonialsIds = {
  section: 'section_1502022357',
  row: 'row-892214119',
  leftCol: 'col-2066013981',
  imageWrapper: 'image_1640056916',
  rightCol: 'col-1087438141',
  eyebrowText: 'text-132396275',
  titleText: 'text-3427176542',
  sliderWrapper: 'slider-1683474440',
  innerGap: 'gap-286215994',
  bottomGap: 'gap-907732655',
  slides: [
    {
      row: 'row-1183734666',
      col: 'col-3641444',
      ndKh: 'text-4199205319',
      line: 'text-2934671928',
      iconBoxText: 'text-3737413789',
    },
    {
      row: 'row-935593802',
      col: 'col-340579823',
      ndKh: 'text-4203082640',
      line: 'text-439225718',
      iconBoxText: 'text-4153297682',
    },
    {
      row: 'row-841982413',
      col: 'col-1290883295',
      ndKh: 'text-1909532206',
      line: 'text-3813892155',
      iconBoxText: 'text-591270540',
    },
  ],
};

export const TESTIMONIALS_IDS_BRANDING_EN: TestimonialsIds = {
  section: 'section_1058517608',
  row: 'row-1555165122',
  leftCol: 'col-716292567',
  imageWrapper: 'image_1092981218',
  rightCol: 'col-1431510694',
  eyebrowText: 'text-2111398339',
  titleText: 'text-3924253219',
  sliderWrapper: 'slider-2036154995',
  innerGap: 'gap-67453680',
  bottomGap: 'gap-1297812330',
  slides: [
    {
      row: 'row-1200332702',
      col: 'col-1806662353',
      ndKh: 'text-2540247936',
      line: 'text-934044303',
      iconBoxText: 'text-2030310328',
    },
    {
      row: 'row-1072477452',
      col: 'col-806909601',
      ndKh: 'text-224544616',
      line: 'text-232645698',
      iconBoxText: 'text-3071157152',
    },
    {
      row: 'row-484425520',
      col: 'col-884657944',
      ndKh: 'text-3864214019',
      line: 'text-3880951653',
      iconBoxText: 'text-189976429',
    },
  ],
};

export const TESTIMONIALS_IDS_WEBSITE_VI: TestimonialsIds = {
  section: 'section_1621881932',
  row: 'row-1287644938',
  leftCol: 'col-1103817318',
  imageWrapper: 'image_1900833344',
  rightCol: 'col-1669334910',
  eyebrowText: 'text-508084474',
  titleText: 'text-552610541',
  sliderWrapper: 'slider-262026549',
  innerGap: 'gap-1674968271',
  slides: [
    {
      row: 'row-1963277569',
      col: 'col-580135037',
      ndKh: 'text-2400365812',
      line: 'text-3646724270',
      iconBoxText: 'text-3106034000',
    },
    {
      row: 'row-815517917',
      col: 'col-1447917875',
      ndKh: 'text-1004470606',
      line: 'text-3651981368',
      iconBoxText: 'text-1171617875',
    },
    {
      row: 'row-154269504',
      col: 'col-1121374790',
      ndKh: 'text-2227838164',
      line: 'text-1018171168',
      iconBoxText: 'text-4197734720',
    },
  ],
};

export const TESTIMONIALS_IDS_WEBSITE_EN: TestimonialsIds = {
  section: 'section_374756684',
  row: 'row-1827612760',
  leftCol: 'col-878805679',
  imageWrapper: 'image_884520639',
  rightCol: 'col-46726236',
  eyebrowText: 'text-2759206197',
  titleText: 'text-3478898043',
  sliderWrapper: 'slider-804919339',
  innerGap: 'gap-180743225',
  slides: [
    {
      row: 'row-1289876109',
      col: 'col-109586615',
      ndKh: 'text-1827915794',
      line: 'text-1535043188',
      iconBoxText: 'text-3958037905',
    },
    {
      row: 'row-1261283420',
      col: 'col-325020848',
      ndKh: 'text-4205329108',
      line: 'text-2644374178',
      iconBoxText: 'text-3399885755',
    },
    {
      row: 'row-1846176215',
      col: 'col-45802561',
      ndKh: 'text-105412325',
      line: 'text-2015754755',
      iconBoxText: 'text-385433945',
    },
  ],
};

export const TESTIMONIALS_IDS_ABOUT_VI: TestimonialsIds = {
  section: 'section_1376011757',
  row: 'row-417662834',
  leftCol: 'col-1704034059',
  imageWrapper: 'image_38454166',
  rightCol: 'col-62393978',
  eyebrowText: 'text-348727923',
  titleText: 'text-851296666',
  sliderWrapper: 'slider-409595782',
  slides: [
    {
      row: 'row-327148031',
      col: 'col-1677345672',
      ndKh: 'text-1992447592',
      line: 'text-595853813',
      iconBoxText: 'text-1047436997',
    },
    {
      row: 'row-418292890',
      col: 'col-956621479',
      ndKh: 'text-4114125688',
      line: 'text-1342772100',
      iconBoxText: 'text-2669029505',
    },
    {
      row: 'row-1207997341',
      col: 'col-312012375',
      ndKh: 'text-728136302',
      line: 'text-3178217724',
      iconBoxText: 'text-312049271',
    },
  ],
};

export const TESTIMONIALS_IDS_ABOUT_EN: TestimonialsIds = {
  section: 'section_229177142',
  row: 'row-845168979',
  leftCol: 'col-778877510',
  imageWrapper: 'image_2128992176',
  rightCol: 'col-1874560149',
  eyebrowText: 'text-3654490439',
  titleText: 'text-2484896865',
  sliderWrapper: 'slider-867989172',
  slides: [
    {
      row: 'row-937930353',
      col: 'col-1248059485',
      ndKh: 'text-1235286067',
      line: 'text-3295138119',
      iconBoxText: 'text-3970224626',
    },
    {
      row: 'row-231975174',
      col: 'col-142339302',
      ndKh: 'text-2685319248',
      line: 'text-4132207334',
      iconBoxText: 'text-1970074443',
    },
    {
      row: 'row-433011727',
      col: 'col-1632026117',
      ndKh: 'text-4198975865',
      line: 'text-2961021405',
      iconBoxText: 'text-2482293849',
    },
  ],
};

export const TESTIMONIALS_LABELS: Record<Locale, CarouselLabels> = {
  vi: {
    prev: 'Trước',
    next: 'Tiếp theo',
    goTo: 'Chuyển tới slide {index}',
  },
  en: {
    prev: 'Previous',
    next: 'Next',
    goTo: 'Go to slide {index}',
  },
};

export interface TestimonialsProps {
  testimonials: Testimonial[];
  avatars?: AssetRef[];
  copy: SectionCopy;
  art: TestimonialsArt;
  ids: TestimonialsIds;
  labels: CarouselLabels;
}

export interface TestimonialsSliderProps {
  testimonials: Testimonial[];
  avatars?: AssetRef[];
  lineArt: AssetRef;
  id: string;
  slideIds?: TestimonialSlideIds[];
  labels: CarouselLabels;
}

/** The `.slide-kh` slider: shared by the section and the story-2.2 carousel fixture. */
export function TestimonialsSlider({
  testimonials,
  avatars = [],
  lineArt,
  id,
  slideIds,
  labels,
}: TestimonialsSliderProps) {
  const avatarMap = new Map(avatars.map((a) => [a.id, a]));
  return (
    <div className="slider-wrapper relative slide-kh" id={id}>
      <Carousel
        className="slider slider-nav-simple slider-nav-large slider-nav-light slider-style-normal slider-show-nav"
        align="center"
        loop
        autoplayMs={6000}
        pauseOnHover
        adaptiveHeight
        arrows
        dots
        dragThreshold={10}
        labels={labels}
      >
        {testimonials.map((t, index) => (
          <TestimonialCard
            key={t.id}
            testimonial={t}
            avatar={t.avatarId ? avatarMap.get(t.avatarId) : undefined}
            lineArt={lineArt}
            ids={slideIds?.[index]}
          />
        ))}
      </Carousel>
    </div>
  );
}

export function Testimonials({
  testimonials,
  avatars = [],
  copy,
  art,
  ids,
  labels,
}: TestimonialsProps) {
  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="section ss-kh" id={ids.section}>
      <div className="section-bg fill" />
      <div className="section-content relative">
        <div className="row row-collapse row-full-width align-middle" id={ids.row}>
          <div id={ids.leftCol} className="col medium-7 small-12 large-7">
            <div className="col-inner">
              <div className="img has-hover x md-x lg-x y md-y lg-y" id={ids.imageWrapper}>
                <div className="img-inner dark">
                  <img
                    decoding="async"
                    width={art.photo.width}
                    height={art.photo.height}
                    src={art.photo.src}
                    className="attachment-original size-original"
                    alt={art.photo.alt}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          </div>
          <div id={ids.rightCol} className="col medium-5 small-12 large-5">
            <div className="col-inner">
              {copy.eyebrow && (
                <div id={ids.eyebrowText} className="text">
                  <h4 style={{ textAlign: 'left' }}>
                    <strong>{copy.eyebrow}</strong>
                  </h4>
                </div>
              )}
              <div id={ids.titleText} className="text">
                <h2>
                  {(copy.titleLines ?? [copy.title]).map((line, i) => (
                    <Fragment key={i}>
                      {/* Source: `nhận xét <br />về` keeps the space before the break. */}
                      {i > 0 && (
                        <>
                          {' '}
                          <br />
                        </>
                      )}
                      {line}
                    </Fragment>
                  ))}
                </h2>
              </div>
              <div
                className="is-divider divider clearfix"
                style={{ maxWidth: '133px', height: '2px', backgroundColor: 'rgb(0, 101, 223)' }}
              />
              <p>
                <img
                  decoding="async"
                  className="alignnone wp-image-3102 size-thumbnail"
                  role="img"
                  src={art.quoteIcon.src}
                  alt={art.quoteIcon.alt}
                  width={art.quoteIcon.width}
                  height={art.quoteIcon.height}
                />
              </p>
              <TestimonialsSlider
                testimonials={testimonials}
                avatars={avatars}
                lineArt={art.line}
                id={ids.sliderWrapper}
                slideIds={ids.slides}
                labels={{ ...labels, region: copy.title }}
              />
              {ids.innerGap && (
                <div
                  id={ids.innerGap}
                  className="gap-element clearfix"
                  style={{ display: 'block', height: 'auto' }}
                />
              )}
            </div>
          </div>
        </div>
        {ids.bottomGap && (
          <div
            id={ids.bottomGap}
            className="gap-element clearfix hide-for-small"
            style={{ display: 'block', height: 'auto' }}
          />
        )}
      </div>
    </section>
  );
}
