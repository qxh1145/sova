import Link from 'next/link';
import { clampPage, paginationItems } from './paginationItems';

export interface PaginationLabels {
  nav: string;
  prev: string;
  next: string;
}

export interface PaginationBaseProps {
  current: number;
  total: number;
  labels: PaginationLabels;
}

export type PaginationProps = PaginationBaseProps &
  (
    | {
        hrefForPage: (page: number) => string;
        onPageChange?: never;
      }
    | {
        onPageChange: (page: number) => void;
        hrefForPage?: never;
      }
  );

export function Pagination(props: PaginationProps) {
  const { current, total, labels } = props;

  if (total <= 1) {
    return null;
  }

  const clampedCurrent = clampPage(current, total);
  const items = paginationItems(clampedCurrent, total);
  const isLinkMode = 'hrefForPage' in props && typeof props.hrefForPage === 'function';

  return (
    <nav
      className="pagination"
      aria-label={labels.nav}
    >
      {isLinkMode ? (
        <>
          {clampedCurrent > 1 && (
            <Link
              className="prev page-numbers"
              href={props.hrefForPage(clampedCurrent - 1)}
              aria-label={labels.prev}
            >
              <i className="fa fa-angle-left" aria-hidden="true" />
            </Link>
          )}
          {items.map((item, idx) => {
            if (item === 'dots') {
              return (
                <span key={`dots-${idx}`} className="page-numbers dots">
                  …
                </span>
              );
            }
            if (item === clampedCurrent) {
              return (
                <span key={item} aria-current="page" className="page-numbers current">
                  {item}
                </span>
              );
            }
            return (
              <Link
                key={item}
                className="page-numbers"
                href={props.hrefForPage(item)}
              >
                {item}
              </Link>
            );
          })}
          {clampedCurrent < total && (
            <Link
              className="next page-numbers"
              href={props.hrefForPage(clampedCurrent + 1)}
              aria-label={labels.next}
            >
              <i className="fa fa-angle-right" aria-hidden="true" />
            </Link>
          )}
        </>
      ) : (
        <>
          <button
            type="button"
            className="prev page-numbers"
            disabled={clampedCurrent <= 1}
            aria-label={labels.prev}
            onClick={() => {
              if (clampedCurrent > 1) {
                props.onPageChange(clampedCurrent - 1);
              }
            }}
          >
            <i className="fa fa-angle-left" aria-hidden="true" />
          </button>
          {items.map((item, idx) => {
            if (item === 'dots') {
              return (
                <span key={`dots-${idx}`} className="page-numbers dots">
                  …
                </span>
              );
            }
            if (item === clampedCurrent) {
              return (
                <span key={item} aria-current="page" className="page-numbers current">
                  {item}
                </span>
              );
            }
            return (
              <button
                key={item}
                type="button"
                className="page-numbers"
                onClick={() => props.onPageChange(item)}
              >
                {item}
              </button>
            );
          })}
          <button
            type="button"
            className="next page-numbers"
            disabled={clampedCurrent >= total}
            aria-label={labels.next}
            onClick={() => {
              if (clampedCurrent < total) {
                props.onPageChange(clampedCurrent + 1);
              }
            }}
          >
            <i className="fa fa-angle-right" aria-hidden="true" />
          </button>
        </>
      )}
    </nav>
  );
}
