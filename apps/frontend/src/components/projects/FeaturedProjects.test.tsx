import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { parse } from 'node-html-parser';
import { ProjectShowcaseItem } from './ProjectShowcaseItem';
import { ProjectCard } from './ProjectCard';
import { FeaturedProjects } from './FeaturedProjects';
import { ProjectListView } from './ProjectListView';
import { ProjectArchiveView } from './ProjectArchiveView';
import { projectListingCopy } from '@/data/listings';
import type { AssetRef, Project, ProjectCategory, SectionCopy } from '@/types/content';

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

  it('omits background image when gallery asset has status missing', () => {
    const projectWithGallery: Project = {
      ...mockProject,
      galleryIds: ['asset-proj-missing'],
    };
    const assetsWithMissing: AssetRef[] = [
      {
        id: 'asset-proj-missing',
        src: '/missing-proj.png',
        alt: '',
        kind: 'image',
        status: 'missing',
        sources: [],
      },
    ];
    const html = renderToStaticMarkup(
      <FeaturedProjects
        projects={[projectWithGallery]}
        copy={mockCopy}
        assets={assetsWithMissing}
        categories={[mockCategory]}
      />,
    );
    expect(html).toContain('Project Without Image');
    expect(html).not.toContain('background-image');
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

  it('renders ProjectShowcaseItem with data-pointer="card" on .item-content', () => {
    const html = renderToStaticMarkup(
      <ProjectShowcaseItem project={mockProject} categoryLabel="Website" />,
    );
    const root = parse(html);
    expect(root.querySelector('.item-content[data-pointer="card"]')).not.toBeNull();
  });

  it('renders ProjectCard with data-pointer="card" on .portfolio-box', () => {
    const html = renderToStaticMarkup(
      <ProjectCard project={mockProject} categoryLabel="Website" />,
    );
    const root = parse(html);
    expect(root.querySelector('.portfolio-box[data-pointer="card"]')).not.toBeNull();
  });

  it('puts data-tilt on .box-image only when the ListView renders the cards', () => {
    const data = {
      projects: [mockProject],
      categories: [{ ...mockCategory, count: 1 }],
      thumbnailAssets: [],
      heroImage: null,
      bgImage: null,
      settings: null,
      copy: projectListingCopy.vi,
      locale: 'vi' as const,
    };
    const list = parse(renderToStaticMarkup(<ProjectListView {...data} />));
    expect(list.querySelectorAll('.portfolio-box > .box-image[data-tilt]')).toHaveLength(1);
    expect(list.querySelector('.portfolio-box[data-tilt]')).toBeNull();

    const archive = parse(
      renderToStaticMarkup(
        <ProjectArchiveView
          {...data}
          ids={{
            section: 's',
            portfolio: 'p',
            hero: {} as Parameters<typeof ProjectArchiveView>[0]['ids']['hero'],
          }}
          listingPath="/featured_item/"
        />,
      ),
    );
    expect(archive.querySelectorAll('.portfolio-box').length).toBeGreaterThan(0);
    expect(archive.querySelector('[data-tilt]')).toBeNull();

    const card = parse(renderToStaticMarkup(<ProjectCard project={mockProject} />));
    expect(card.querySelector('[data-tilt]')).toBeNull();
  });

  describe('Accordion variant', () => {
    const sixProjects: Project[] = Array.from({ length: 6 }, (_, i) => ({
      ...mockProject,
      id: `proj-${i + 1}`,
      slug: `proj-${i + 1}`,
      title: `Project ${i + 1}`,
      path: `/featured_item/proj-${i + 1}/`,
      galleryIds: [`asset-proj-${i + 1}`],
    }));

    const sixAssets: AssetRef[] = Array.from({ length: 6 }, (_, i) => ({
      id: `asset-proj-${i + 1}`,
      src: `/images/proj-${i + 1}.webp`,
      alt: `Project ${i + 1} screenshot`,
      kind: 'image',
      status: 'local',
      sources: [],
    }));

    it('renders 6 links in order with href, title, category, and img', () => {
      const html = renderToStaticMarkup(
        <FeaturedProjects
          projects={sixProjects}
          copy={mockCopy}
          assets={sixAssets}
          categories={[mockCategory]}
          variant="accordion"
        />,
      );
      const root = parse(html);

      const section = root.querySelector('.horizontal-scroll-section--accordion');
      expect(section).not.toBeNull();

      const panels = root.querySelectorAll('.accordion-gallery-panel');
      expect(panels).toHaveLength(6);

      for (let i = 0; i < 6; i++) {
        const panel = panels[i];
        expect(panel.getAttribute('href')).toBe(`/featured_item/proj-${i + 1}/`);
        expect(panel.querySelector('h3.accordion-gallery-title')?.text).toBe(`Project ${i + 1}`);
        expect(panel.querySelector('.accordion-gallery-category')?.text).toContain('Website');
        const img = panel.querySelector('img.accordion-gallery-img');
        expect(img).not.toBeNull();
        expect(img?.getAttribute('src')).toBe(`/images/proj-${i + 1}.webp`);
      }
    });

    it('sets first panel to default active (data-state="active") and others to inactive', () => {
      const html = renderToStaticMarkup(
        <FeaturedProjects
          projects={sixProjects}
          copy={mockCopy}
          assets={sixAssets}
          categories={[mockCategory]}
          variant="accordion"
        />,
      );
      const root = parse(html);
      const panels = root.querySelectorAll('.accordion-gallery-panel');
      expect(panels[0].getAttribute('data-state')).toBe('active');
      for (let i = 1; i < panels.length; i++) {
        expect(panels[i].getAttribute('data-state')).toBe('inactive');
      }
    });

    it('renders panel with title and category but without img when gallery asset is missing', () => {
      let html = '';
      expect(() => {
        html = renderToStaticMarkup(
          <FeaturedProjects
            projects={[mockProject]}
            copy={mockCopy}
            assets={[]}
            categories={[mockCategory]}
            variant="accordion"
          />,
        );
      }).not.toThrow();

      const root = parse(html);
      const panel = root.querySelector('.accordion-gallery-panel');
      expect(panel).not.toBeNull();
      expect(panel?.querySelector('h3.accordion-gallery-title')?.text).toBe(
        'Project Without Image',
      );
      expect(panel?.querySelector('.accordion-gallery-category')?.text).toContain('Website');
      expect(panel?.querySelector('img.accordion-gallery-img')).toBeNull();
    });
  });
});
