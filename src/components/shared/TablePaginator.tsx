import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { Dispatch, SetStateAction } from 'react';

import type { PaginationType } from '@/types/ResponseTypes';
import { Button } from '@/components/ui/button';

interface TablePaginatorProps {
  meta: PaginationType;
  setPage?: Dispatch<SetStateAction<number>>;
  showPagination?: boolean;
}

export default function TablePaginator({
  meta,
  setPage,
  showPagination = true,
}: TablePaginatorProps) {
  const { page, total_page, has_next_page, has_previous_page } = meta;

  console.log(page, total_page, has_next_page, has_previous_page)

  if (!showPagination) return null;

  return (
    <div className="pagination-ctr flex items-center justify-between sm:mx-20 md:mx-0 md:justify-end sm:space-x-2 mt-[32px]">
      {/* Previous */}
      <Button
        variant="ghost"
        size="sm"
        disabled={!has_previous_page}
        onClick={() => has_previous_page && setPage?.(page - 1)}
      >
        <ArrowLeft className="w-[18px] h-[18px] mr-1" />
        Previous
      </Button>

      {/* Page 1 */}
      <Button
        variant={page === 1 ? 'default' : 'ghost'}
        size="sm"
        className="rounded-3xl p-4"
        onClick={() => setPage?.(1)}
      >
        1
      </Button>

      {/* Page 2 */}
      {total_page > 1 && (
        <Button
          variant={page === 2 ? 'default' : 'ghost'}
          size="sm"
          className={`rounded-3xl p-4 ${total_page > 2 ? 'visible' : 'hidden'}`}
          onClick={() => setPage?.(2)}
        >
          2
        </Button>
      )}

      {/* Leading ellipsis */}
      <span
        className={
          page < 4 || total_page === 4
            ? 'hidden'
            : 'visible'
        }
      >
        ...
      </span>

      {/* Current page (middle range) */}
      {page >= 3 && page <= total_page - 2 && (
        <Button variant="default" size="sm" className="rounded-3xl p-4">
          {page}
        </Button>
      )}

      {/* Trailing ellipsis */}
      <span
        className={
          page > total_page - 3 || total_page === 4
            ? 'hidden'
            : 'visible'
        }
      >
        ...
      </span>

      {/* Last - 1 */}
      {total_page > 2 && (
        <Button
          variant={page === total_page - 1 ? 'default' : 'ghost'}
          size="sm"
          className={`rounded-3xl p-4 ${total_page > 3 ? 'visible' : 'hidden'}`}
          onClick={() => setPage?.(total_page - 1)}
        >
          {total_page - 1}
        </Button>
      )}

      {/* Last */}
      {total_page > 1 && (
        <Button
          variant={page === total_page ? 'default' : 'ghost'}
          size="sm"
          className="rounded-3xl p-4"
          onClick={() => setPage?.(total_page)}
        >
          {total_page}
        </Button>
      )}

      {/* Next */}
      <Button
        variant="ghost"
        size="sm"
        disabled={!has_next_page}
        onClick={() => has_next_page && setPage?.(page + 1)}
      >
        Next
        <ArrowRight className="w-[18px] h-[18px] ml-1" />
      </Button>
    </div>
  );
}
