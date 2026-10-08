import '@/styles/legacy/sections/route-featured_item--cong-ty-co-phan-phat-trien-cong-nghe-thp.css';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { listRoutes } from '@/lib/queries/site';
import { getProjectDetail } from '@/lib/queries/projects';
import { ProjectHero } from './_components/ProjectHero';
import { ProjectGallery } from './_components/ProjectGallery';
import { ProjectBodyLayout } from './_components/ProjectBodyLayout';
import { ProjectContent } from './_components/ProjectContent';
import { ProjectInfoSidebar } from './_components/ProjectInfoSidebar';
import { RelatedProjects } from './_components/RelatedProjects';

export async function generateStaticParams() {
  const routes = await listRoutes();
  return routes
    .filter((r) => r.locale === 'vi' && r.kind === 'project-detail')
    .map((r) => ({
      slug: r.path.replace(/^\/featured_item\/|\/$/g, ''),
    }));
}

interface ProjectDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProjectDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const detail = await getProjectDetail(slug);
  if (!detail) return {};

  return {
    title: detail.project.seo.title,
    description: detail.project.seo.description,
  };
}

export default async function ViProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { slug } = await params;
  const detail = await getProjectDetail(slug);
  if (!detail) {
    notFound();
  }

  const { project, heroAsset, galleryAssets, terms, related } = detail;

  return (
    <div className="portfolio-page-wrapper portfolio-single-page">
      <ProjectHero title={project.title} heroImage={heroAsset} />
      <ProjectGallery galleryAssets={galleryAssets} />
      <ProjectBodyLayout
        title={project.title}
        sidebar={<ProjectInfoSidebar summary={project.summary} />}
      >
        <ProjectContent terms={terms} displayDate={project.displayDate} />
      </ProjectBodyLayout>
      <RelatedProjects related={related} />
    </div>
  );
}
