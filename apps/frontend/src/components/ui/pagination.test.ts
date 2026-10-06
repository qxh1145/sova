import { describe, expect, it } from 'vitest';
import { paginationItems } from './pagination';

describe('paginationItems', () => {
  it('handles page 1 of 5 (1 2 3 … 5)', () => {
    expect(paginationItems(1, 5)).toEqual([1, 2, 3, 'dots', 5]);
  });

  it('handles page 2 of 5 (1 2 3 4 5)', () => {
    expect(paginationItems(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it('handles page 5 of 5 (1 … 3 4 5)', () => {
    expect(paginationItems(5, 5)).toEqual([1, 'dots', 3, 4, 5]);
  });

  it('handles middle gap on page 4 of 9 (1 2 3 4 5 6 … 9)', () => {
    expect(paginationItems(4, 9)).toEqual([1, 2, 3, 4, 5, 6, 'dots', 9]);
  });

  it('handles single page total=1 by returning empty array', () => {
    expect(paginationItems(1, 1)).toEqual([]);
    expect(paginationItems(0, 1)).toEqual([]);
    expect(paginationItems(2, 1)).toEqual([]);
  });

  it('clamps current below 1 to 1', () => {
    expect(paginationItems(0, 5)).toEqual([1, 2, 3, 'dots', 5]);
    expect(paginationItems(-5, 5)).toEqual([1, 2, 3, 'dots', 5]);
  });

  it('clamps current above total to total', () => {
    expect(paginationItems(6, 5)).toEqual([1, 'dots', 3, 4, 5]);
    expect(paginationItems(100, 5)).toEqual([1, 'dots', 3, 4, 5]);
  });

  it('handles total <= 0 by returning empty array', () => {
    expect(paginationItems(1, 0)).toEqual([]);
    expect(paginationItems(1, -3)).toEqual([]);
  });
});
