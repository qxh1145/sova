'use client';

import { useState } from 'react';
import { Pagination, type PaginationLabels } from '@/components/ui/Pagination.tsx';

export interface ActionPaginationDemoProps {
  labels: PaginationLabels;
  initialPage?: number;
  total?: number;
}

export function ActionPaginationDemo({
  labels,
  initialPage = 1,
  total = 5,
}: ActionPaginationDemoProps) {
  const [currentPage, setCurrentPage] = useState<number>(initialPage);
  const [lastPage, setLastPage] = useState<number | null>(null);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setLastPage(page);
  };

  return (
    <div data-testid="action-pagination-demo">
      <div data-testid="last-page">{lastPage !== null ? String(lastPage) : ''}</div>
      <Pagination
        current={currentPage}
        total={total}
        labels={labels}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
