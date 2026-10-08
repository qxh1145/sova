'use client';

import { useMemo, useState } from 'react';
import type { AssetRef, Locale, ProjectCategory } from '@/types/content';
import { ProjectCard, categoryLabel, type ProjectCardData } from './ProjectCard';
import { ProjectGrid, type ProjectGridProps } from './ProjectGrid';
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
  /** Cards per page; absent shows every card and renders no pagination wrapper. */
  pageSize?: number;
  wrapperId?: string;
  grid?: Omit<ProjectGridProps, 'children'>;
}

export function ProjectFilters({
  projects,
  categories,
  thumbnailAssets,
  listingPath,
  locale,
  loading = false,
  emptyMessage,
  loadingMessage,
  filterAllLabel,
  paginationLabels,
  pageSize,
  wrapperId = 'portfolio-wrapper',
  grid = { id: 'portfolio-results' },
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

  const totalPages = pageSize ? Math.ceil(filteredProjects.length / pageSize) || 1 : 1;

  const paginatedProjects = useMemo(() => {
    if (!pageSize) return filteredProjects;
    const start = (currentPage - 1) * pageSize;
    return filteredProjects.slice(start, start + pageSize);
  }, [filteredProjects, currentPage, pageSize]);

  const handleFilterClick = (slug: string) => {
    setSelectedSlug(slug);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const wrapper = document.getElementById(wrapperId);
    if (wrapper) {
      const top = wrapper.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  return (
    <div id={wrapperId} className="portfolio-element-wrapper has-filtering">
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

      <ProjectGrid {...grid}>
        {loading ? (
          <p>{loadingMessage}</p>
        ) : filteredProjects.length === 0 ? (
          <p>{emptyMessage}</p>
        ) : (
          paginatedProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              thumbnailAsset={project.thumbnailId ? assetMap.get(project.thumbnailId) : undefined}
              categoryLabel={categoryLabel(project.categoryIds, categoryMap)}
            />
          ))
        )}
      </ProjectGrid>

      {pageSize && paginationLabels ? (
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
      ) : null}
    </div>
  );
}
