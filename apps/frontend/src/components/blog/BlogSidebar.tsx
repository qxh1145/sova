import Link from 'next/link';
import type { PostCategory } from '@/types/content';
import type { blogListingCopy } from '@/data/listings';

export interface BlogSidebarProps {
  categories: (PostCategory & { count: number })[];
  copy: (typeof blogListingCopy)['vi'] | (typeof blogListingCopy)['en'];
}

export function BlogSidebar({ categories, copy }: BlogSidebarProps) {
  // Source: empty #secondary (no asides) when the locale has no categories (EN)
  if (categories.length === 0) {
    return (
      <div id="secondary" className="widget-area " role="complementary" />
    );
  }

  return (
    <div id="secondary" className="widget-area " role="complementary">
      <aside id="search-5" className="widget widget_search">
        <span className="widget-title ">
          <span>{copy.searchTitle}</span>
        </span>
        <div className="is-divider small" />
        <form method="get" className="searchform" action="/" role="search">
          <div className="flex-row relative">
            <div className="flex-col flex-grow">
              <input
                type="search"
                className="search-field mb-0"
                name="s"
                defaultValue=""
                id="s"
                placeholder={copy.searchPlaceholder}
              />
            </div>
            <div className="flex-col">
              <button
                type="submit"
                className="ux-search-submit submit-button secondary button icon mb-0"
                aria-label={copy.searchSubmit}
              >
                <i className="icon-search" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div className="live-search-results text-left z-top" />
        </form>
      </aside>
      <aside id="categories-14" className="widget widget_categories">
        <span className="widget-title ">
          <span>{copy.categoriesTitle}</span>
        </span>
        <div className="is-divider small" />
        <ul>
          {categories.map((category) => (
            <li key={category.id} className="cat-item">
              <Link href={category.path}>{category.title}</Link> ({category.count})
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
