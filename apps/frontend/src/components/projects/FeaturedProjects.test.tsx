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

  it('renders titleLines with <br /> between lines like the source h2', () => {
    const html = renderToStaticMarkup(
      <FeaturedProjects
        projects={[mockProject]}
        copy={{ ...mockCopy, titleLines: ['Dự án chứa đựng', 'Tâm huyết Sáng tạo'] }}
      />,
    );
    expect(html).toContain('Dự án chứa đựng<br/>Tâm huyết Sáng tạo</h2>');
  });

  it('renders card without background image when project has no gallery asset (no throw)', () => {
    let html = '';
    expect(() => {
      html = renderToStaticMarkup(
        <ProjectShowcaseItem project={mockProject} categoryLabel="Website" />,
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

  it('uses the Home source ids when no ids prop is passed', () => {
    const html = renderToStaticMarkup(
      <FeaturedProjects projects={[mockProject]} copy={mockCopy} />,
    );
    expect(html).toContain('id="row-2138573453"');
    expect(html).toContain('id="col-765783521"');
    expect(html).toContain('id="text-980725794"');
    expect(html).toContain('id="text-3520817437"');
  });

  it('overrides the default ids with the ids prop', () => {
    const html = renderToStaticMarkup(
      <FeaturedProjects
        projects={[mockProject]}
        copy={mockCopy}
        ids={{ row: 'row-1', col: 'col-1', eyebrow: 'text-1', title: 'text-2' }}
      />,
    );
    expect(html).toContain('id="row-1"');
    expect(html).toContain('id="col-1"');
    expect(html).toContain('id="text-1"');
    expect(html).toContain('id="text-2"');
    expect(html).not.toContain('row-2138573453');
    expect(html).not.toContain('text-3520817437');
  });

  it('returns null when projects list is empty', () => {
    const html = renderToStaticMarkup(<FeaturedProjects projects={[]} copy={mockCopy} />);
    expect(html).toBe('');
  });
});
