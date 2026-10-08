'use client';

import { useMemo, useState } from 'react';
import type { AssetRef, Locale, ProjectCategory } from '@/types/content';
import { ProjectCard, type ProjectCardData } from './ProjectCard';
import { ProjectGrid } from './ProjectGrid';
import { Pagination, type PaginationLabels } from '@/components/ui/Pagination';

export interface ProjectFiltersProps {
  projects: ProjectCardData[];
  categories: (ProjectCategory & { count: number })[];
  /** Listing route path; filter links point here so middle-click and no-JS stay on the page. */
  listingPath: string;
  thumbnailAssets: AssetRef[];
  locale: Locale;
  loading?: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
  filterAllLabel?: string;
  paginationLabels?: PaginationLabels;
}

const PAGE_SIZE = 6;

export function ProjectFilters({
  projects,
  categories,
  thumbnailAssets,
  listingPath,
  locale,
  loading = false,
  emptyMessage = 'Không có dự án nào.',
  loadingMessage = 'Đang tải...',
  filterAllLabel = 'Tất cả',
  paginationLabels = {
    nav: 'Phân trang dự án',
    prev: 'Trang trước',
    next: 'Trang tiếp theo',
  },
}: ProjectFiltersProps) {
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);

  const assetMap = useMemo(() => {
    return new Map(thumbnailAssets.map((a) => [a.id, a]));
  }, [thumbnailAssets]);

  const categoryMap = useMemo(() => {
    return new Map(categories.map((c) => [c.id, c.label]));
  }, [categories]);

  // EN shows only "All", as source
  const isEn = locale === 'en';

  // Filter in memory
  const filteredProjects = useMemo(() => {
    if (!selectedSlug) return projects;
    const matchingCat = categories.find((c) => c.slug === selectedSlug);
    if (!matchingCat) return projects;
    return projects.filter((p) => p.categoryIds.includes(matchingCat.id));
  }, [projects, selectedSlug, categories]);

  const totalPages = Math.ceil(filteredProjects.length / PAGE_SIZE) || 1;

  const paginatedProjects = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProjects.slice(start, start + PAGE_SIZE);
  }, [filteredProjects, currentPage]);

  const handleFilterClick = (slug: string) => {
    setSelectedSlug(slug);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const wrapper = document.getElementById('portfolio-wrapper');
    if (wrapper) {
      const top = wrapper.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div id="portfolio-wrapper" className="portfolio-element-wrapper has-filtering">
      <div className="container mb-half">
        <ul className="nav nav-left nav-center nav-line-grow nav-uppercase filter-nav">
          <li className={selectedSlug === '' ? 'active' : ''}>
            <a
              href={listingPath}
              data-term=""
              onClick={(e) => {
                e.preventDefault();
                handleFilterClick('');
              }}
            >
              {filterAllLabel}
            </a>
          </li>
          {!isEn &&
            categories.map((cat) => (
              <li key={cat.id} className={selectedSlug === cat.slug ? 'active' : ''}>
                <a
                  href={listingPath}
                  data-term={cat.slug}
                  onClick={(e) => {
                    e.preventDefault();
                    handleFilterClick(cat.slug);
                  }}
                >
                  {cat.label}
                </a>
              </li>
            ))}
        </ul>
      </div>

      <ProjectGrid id="portfolio-results">
        {loading ? (
          <p>{loadingMessage}</p>
        ) : filteredProjects.length === 0 ? (
          <p>{emptyMessage}</p>
        ) : (
          paginatedProjects.map((project) => {
            const catLabel = project.categoryIds
              .map((id) => categoryMap.get(id))
              .filter(Boolean)
              .join(', ');
            return (
              <ProjectCard
                key={project.id}
                project={project}
                thumbnailAsset={project.thumbnailId ? assetMap.get(project.thumbnailId) : undefined}
                categoryLabel={catLabel}
              />
            );
          })
        )}
      </ProjectGrid>

      <div className="pagination-wrapper text-center mt-20" id="portfolio-pagination">
        {!loading && filteredProjects.length > 0 && totalPages > 1 ? (
          <Pagination
            current={currentPage}
            total={totalPages}
            labels={paginationLabels}
            onPageChange={handlePageChange}
          />
        ) : null}
      </div>
    </div>
  );
}
