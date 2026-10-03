export type Locale = 'vi' | 'en';
export type EntityId = string;

export interface LinkModel {
  label: string;
  href: string;
  external?: boolean;
}

export interface SiteSettings {
  locale: Locale;
  companyName: string;
  address: string;
  phones: { label: string; href: string }[];
  email: string;
  socialLinks: LinkModel[];
  mapEmbedUrl: string;
  logoIds: EntityId[];
}
