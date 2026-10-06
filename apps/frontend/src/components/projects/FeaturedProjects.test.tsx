import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { ProjectShowcaseItem } from './ProjectShowcaseItem';
import { FeaturedProjects } from './FeaturedProjects';
import type { Project, ProjectCategory, SectionCopy } from '@/types/content';

describe('FeaturedProjects and ProjectShowcaseItem edge cases', () => {
  const mockProject: Project = {
    id: 'proj-no-img',
    locale: 'vi',
    slug: 'proj-no-img',
    title: 'Project Without Image',
    path: '/featured_item/proj-no-img/',
    categoryIds: ['project-category-website'],
    galleryIds: [],
    body: { format: 'sanitized-html', html: '', assetIds: [], sources: [] },
    metadata: [],
    relatedProjectIds: [],
    seo: { title: 'SEO Title', canonicalPath: '/featured_item/proj-no-img/' },
    sources: [],
  };

  const mockCategory: ProjectCategory = {
    id: 'project-category-website',
    slug: 'website',
    label: 'Website',
    locale: 'vi',
    path: '/featured_item_category/thiet-ke-website/',
  };

  const mockCopy: SectionCopy = {
    eyebrow: 'Projects',
    title: 'Featured Projects',
  };

  it('renders card without background image when project has no gallery asset (no throw)', () => {
    let html = '';
    expect(() => {
      html = renderToStaticMarkup(
        <ProjectShowcaseItem
          project={mockProject}
          categoryLabel="Website"
        />,
      );
    }).not.toThrow();

    expect(html).toContain('Project Without Image');
    expect(html).toContain('item-content');
    expect(html).not.toContain('background-image');
    expect(html).not.toContain('background-image:');
  });

  it('renders FeaturedProjects with missing gallery asset without throwing', () => {
    let html = '';
    expect(() => {
      html = renderToStaticMarkup(
        <FeaturedProjects
          projects={[mockProject]}
          copy={mockCopy}
          assets={[]}
          categories={[mockCategory]}
        />,
      );
    }).not.toThrow();

    expect(html).toContain('Project Without Image');
    expect(html).toContain('Website');
  });

  it('returns null when projects list is empty', () => {
    const html = renderToStaticMarkup(
      <FeaturedProjects projects={[]} copy={mockCopy} />,
    );
    expect(html).toBe('');
  });
});
