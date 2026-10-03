import { getRepository } from '@/lib/repositories';
import type {
  AboutPageContent,
  CompanyProfileContent,
  ContactPageContent,
  EntityId,
  HomePageContent,
  LegalPage,
  ListingSettings,
  Locale,
} from '@/types/content';

export function getHomePage(locale: Locale): Promise<HomePageContent | null> {
  return getRepository().getHomePage(locale);
}

export function getAboutPage(locale: Locale): Promise<AboutPageContent | null> {
  return getRepository().getAboutPage(locale);
}

export function getContactPage(locale: Locale): Promise<ContactPageContent | null> {
  return getRepository().getContactPage(locale);
}

export function getProfile(locale: Locale): Promise<CompanyProfileContent | null> {
  return getRepository().getProfile(locale);
}

export function getLegalPage(path: string, locale: Locale): Promise<LegalPage | null> {
  return getRepository().getLegalPage(path, locale);
}

export function getListingSettings(routeId: EntityId): Promise<ListingSettings | null> {
  return getRepository().getListingSettings(routeId);
}
