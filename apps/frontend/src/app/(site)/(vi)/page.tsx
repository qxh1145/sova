import { getSiteSettings } from '@/lib/queries/site';

export default async function HomePage() {
  const { companyName } = await getSiteSettings('vi');
  return <main>{companyName}</main>;
}
