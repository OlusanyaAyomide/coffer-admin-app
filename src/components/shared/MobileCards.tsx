import { Dispatch, ReactNode, SetStateAction } from 'react';

import { PaginationType } from '@/types/ResponseTypes';
import TablePaginator from '@/components/shared/TablePaginator';
import { cn } from '@/lib/utils';

export type MobileRow<CardData> = {
  cell: ({ row }: { row: CardData }) => ReactNode;
  showBorder?: boolean;
  className?: string;
};

type MobileCardsProps<CardData> = {
  data: CardData[];
  columns: MobileRow<CardData>[];
  title: (row: CardData) => string | ReactNode;
  action?: ({ row }: { row: CardData }) => ReactNode;
  meta?: PaginationType;
  setPage?: Dispatch<SetStateAction<number>>;
  testIdKey?: keyof CardData;
  titleClassName?: string;
  footer?: ({ row }: { row: CardData }) => ReactNode;
};

export default function MobileCards<CardData>({
  data,
  columns,
  title,
  action,
  meta,
  setPage,
  testIdKey,
  titleClassName,
  footer,
}: MobileCardsProps<CardData>) {
  return (
    <div className="py-2 lg:hidden mb-10">
      {data.map((row, index) => {
        const testId =
          testIdKey && typeof row[testIdKey] === 'string'
            ? `mobile-card-${row[testIdKey]}`
            : undefined;

        return (
          <div
            key={(index + 1).toString()}
            data-testid={testId}
            className={cn(
              'mt-6 rounded-lg px-2 py-4 xs:px-3',
              'bg-card text-foreground',
              'border border-border',
              'shadow-[0px_3px_14px_0px_rgba(0,0,0,0.10)]',
              'transition-colors',
              'hover:bg-accent/30'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <span
                className={cn(
                  'text-base font-medium leading-tight',
                  'text-foreground',
                  titleClassName
                )}
              >
                {title(row)}
              </span>

              {action && action({ row })}
            </div>

            {/* Body */}
            <div className="mt-2 flex flex-wrap gap-2 text-sm text-muted-foreground">
              {columns.map(({ cell, showBorder = true, className }, idx) => (
                <span
                  key={(idx + 1).toString()}
                  className={cn(
                    'flex items-center',
                    showBorder && 'border-r border-border pr-3',
                    className
                  )}
                >
                  {cell({ row })}
                </span>
              ))}
            </div>

            {/* Footer */}
            {footer && (
              <div className="mt-3 border-t border-border pt-3 text-sm">
                {footer({ row })}
              </div>
            )}
          </div>
        );
      })}

      {meta && (
        <div className="md:hidden">
          <TablePaginator
            meta={meta}
            setPage={setPage}
            showPagination={meta.total_page > 1}
          />
        </div>
      )}
    </div>
  );
}
