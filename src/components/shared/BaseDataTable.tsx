/* eslint-disable  react-hooks/incompatible-library */

import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable
} from '@tanstack/react-table';
import type { Dispatch, SetStateAction } from 'react';
import type {
  ColumnDef,
  CoreColumn
} from '@tanstack/react-table';

import type { PaginationType } from '@/types/ResponseTypes';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ITEMS_COUNT_PER_PAGE } from '@/constants/Constants';
import TablePaginator from '@/components/shared/TablePaginator';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';

export type ExtendedCoreColumnDef<TData, TValue> = CoreColumn<TData, TValue> & {
  meta?: {
    className?: string;
  };
};

export type ExtendedColumnDef<TData> = ColumnDef<TData> & {
  meta?: {
    className?: string;
  };
  accessorKey: string
};

export type DataTableProps<TData> = {
  columns: Array<ExtendedColumnDef<TData>>;
  data: Array<TData>;
  addCheckBox?: boolean
  meta?: PaginationType;
  isSecondary?: boolean
  showOnMobile?: boolean
  setPage?: Dispatch<SetStateAction<number>>;
};

export default function BaseDataTable<TData>({
  columns,
  data,
  addCheckBox,
  meta,
  showOnMobile = false,
  setPage,
}: DataTableProps<TData>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: meta?.limit || ITEMS_COUNT_PER_PAGE,
      },
    },
    manualPagination: true,
  });

  const [checkedRows, setCheckedRows] = useState<Array<string>>([]);

  const handleCheckedChange = (rowId: string) => {
    setCheckedRows((prev) => {
      if (prev.includes(rowId)) {
        return prev.filter((val) => val !== rowId);
      }
      return [...prev, rowId];
    });
  };

  if (!table.getRowModel().rows?.length) {
    return (
      <div className='h-24 flex justify-center items-center'>
        <span className='font-medium text-muted-foreground'>Table is empty </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        !showOnMobile && 'hidden',
        'lg:block rounded-lg overflow-hidden mb-[56px] 2xl:max-w-[6412px]'
      )}
    >
      <div className="border border-border rounded-lg bg-card overflow-auto">
        <Table className="min-w-[800px]">
          {/* HEADER */}
          <TableHeader className="bg-muted text-muted-foreground">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="[&_th:last-child]:rounded-tr-lg h-[56px]"
              >
                {/* S/N or Checkbox header */}
                <TableHead
                  className={cn(
                    'truncate rounded-tl-lg max-w-[15vw]',
                    'bg-secondary text-secondary-foreground',
                    !addCheckBox && 'border-r-0 border-border'
                  )}
                >
                  {addCheckBox ? '' : 'S/N'}
                </TableHead>

                {headerGroup.headers.map((header) => {
                  const customClassName = (
                    header.column.columnDef as ExtendedCoreColumnDef<TData, TData>
                  ).meta?.className;

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        'truncate min-w-[120px]',
                        'bg-secondary text-secondary-foreground',
                        'border-r-0 border-border last:border-r-0',
                        !customClassName && 'max-w-[10vw]',
                        customClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          {/* BODY */}
          <TableBody
            className={cn(
              'text-sm text-muted-foreground',
              'border-r-0 border-border',
              '[&_tr:nth-child(even)]:bg-muted/40'
            )}
          >
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row, index) => {
                const sn = meta
                  ? (meta.page - 1) * ITEMS_COUNT_PER_PAGE + (index + 1)
                  : index + 1;

                return (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && 'selected'}
                    className={cn(
                      'h-[56px] leading-5',
                      'hover:bg-accent/40',
                      'data-[state=selected]:bg-accent'
                    )}
                  >
                    {/* Checkbox / S/N */}
                    <TableCell
                      className={cn(
                        'truncate max-w-[10vw]',
                        !addCheckBox && 'border-l-0 border-border'
                      )}
                    >
                      {addCheckBox ? (
                        <Checkbox
                          checked={checkedRows.includes(row.id)}
                          onCheckedChange={() => handleCheckedChange(row.id)}
                          className={cn(
                            'h-[18px] w-[18px] rounded-sm',
                            'data-[state=checked]:bg-primary',
                            'data-[state=checked]:border-primary'
                          )}
                        />
                      ) : (
                        sn || index + 1
                      )}
                    </TableCell>

                    {row.getVisibleCells().map((cell) => {
                      const customClassName =
                        (cell.column.columnDef as ExtendedColumnDef<TData>)
                          .meta?.className ?? '';

                      return (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            'truncate min-w-[120px]',
                            'border-r-0 border-border last:border-r-0',
                            !customClassName && 'max-w-[10vw]',
                            customClassName
                          )}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-muted-foreground"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {meta && (
        <TablePaginator
          meta={meta}
          setPage={setPage}
          showPagination={
            table.getRowModel().rows.length >= 1 && meta.total_page > 1
          }
        />
      )}
    </div>

  );
}
