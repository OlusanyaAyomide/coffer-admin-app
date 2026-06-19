import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import type { DataTableProps } from '@/components/shared/BaseDataTable';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import BaseDataTable from '@/components/shared/BaseDataTable';

import { titleCaseUnderscoreDash } from '@/services/TextServices';


type CustomizableTableProps<TData> = {
  children: ReactNode;
  tableKey: string;
  defaultVisibleColumns: Array<string>;
} & DataTableProps<TData>;

export default function CustomizableTable<TData>({
  columns,
  data,
  meta,
  setPage,
  children,
  tableKey,
  defaultVisibleColumns,
  isLoading,
}: CustomizableTableProps<TData>) {

  // Initialize state from localStorage or defaults
  const [excludedFields, setExcludedFields] = useState<Array<string>>(() => {
    const stored = localStorage.getItem(`table-config-${tableKey}`);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }

    // Get all accessorKeys from columns
    const allAccessorKeys = columns
      .map((col) => col.accessorKey)
      .filter(Boolean);

    return allAccessorKeys.filter((key) => !defaultVisibleColumns.includes(key));
  });

  // Save to localStorage whenever excludedFields changes
  useEffect(() => {
    localStorage.setItem(`table-config-${tableKey}`, JSON.stringify(excludedFields));
  }, [excludedFields, tableKey]);

  const handleFilterChange = (accessorKey: string) => {
    setExcludedFields((prev) => {
      if (prev.includes(accessorKey)) {
        return prev.filter((item) => item !== accessorKey);
      }
      return [...prev, accessorKey];
    });
  };

  const handleSelectAll = () => {
    const allAccessorKeys = columns
      .map((tableColumn) => tableColumn.accessorKey)
      .filter(Boolean);

    if (!excludedFields.length) {
      setExcludedFields(allAccessorKeys);
    } else {
      setExcludedFields([]);
    }
  };

  const handleResetToDefault = () => {
    const allAccessorKeys = columns
      .map((col) => col.accessorKey)
      .filter(Boolean);

    const defaultExcluded = allAccessorKeys.filter(
      (key) => !defaultVisibleColumns.includes(key)
    );
    setExcludedFields(defaultExcluded);
  };

  const isDefaultState = () => {
    const allAccessorKeys = columns
      .map((col) => col.accessorKey)
      .filter(Boolean);

    const defaultExcluded = allAccessorKeys.filter(
      (key) => !defaultVisibleColumns.includes(key)
    );

    return (
      excludedFields.length === defaultExcluded.length &&
      excludedFields.every((field) => defaultExcluded.includes(field))
    );
  };

  const filteredColumns = columns.filter(
    (tableColumn) => !excludedFields.includes(tableColumn.accessorKey)
  );

  return (
    <div className="max-md:hidden mt-7 w-full">
      {/* Filters row with column selector inline */}
      <div className="mb-5 section-scroll overflow-y-hidden flex items-center justify-between gap-4">
        <div className="flex-1">{children}</div>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 rounded-md h-10 px-3 gap-1.5 text-sm font-medium"
            >
              <img src="/TableTogge.svg" alt="TableToggle" width={14} height={14} />
              Select Columns
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-md">
            <SheetHeader className="border-b border-border">
              <div className="flex items-center justify-between gap-2 pr-8">
                <SheetTitle className="text-base font-semibold text-foreground">
                  Select Columns
                </SheetTitle>
                <Button
                  onClick={handleSelectAll}
                  variant="ghost"
                  size="sm"
                  className="px-3 h-8 text-sm font-medium text-primary hover:text-primary hover:bg-primary/10"
                >
                  {!excludedFields.length ? 'Unselect all' : 'Select all'}
                </Button>
              </div>
              <SheetDescription className="sr-only">
                Choose which columns to display in the table
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Reset to Default button */}
              {!isDefaultState() && (
                <Button
                  onClick={handleResetToDefault}
                  variant="ghost"
                  size="sm"
                  className="mb-2 px-0 h-auto text-sm w-fit mr-auto font-medium text-muted-foreground hover:text-foreground hover:bg-transparent"
                >
                  Reset to Default
                </Button>
              )}
              <div className="flex flex-col gap-1.5">
                {columns.map((column, index) => {
                  const accessorKey = column.accessorKey;

                  // Skip columns without accessorKey
                  if (!accessorKey) return null;

                  return (
                    <div
                      key={accessorKey || index.toString()}
                      className="flex items-center gap-3 py-2 px-3 rounded-md hover:bg-accent/50 transition-colors cursor-pointer"
                      onClick={() => handleFilterChange(accessorKey)}
                    >
                      <Checkbox
                        className="h-[18px] w-[18px] rounded-[5px] data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                        checked={!excludedFields.includes(accessorKey)}
                        onCheckedChange={() => handleFilterChange(accessorKey)}
                        onClick={() => handleFilterChange(accessorKey)}
                      />
                      <span className="text-sm font-medium text-foreground select-none">
                        {titleCaseUnderscoreDash(column.accessorKey)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-border p-6">
              <SheetClose asChild>
                <Button className="ml-auto w-full">
                  <span className="font-medium text-sm">Done</span>
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Table */}
      <div>
        <BaseDataTable
          columns={filteredColumns}
          setPage={setPage}
          data={data}
          meta={meta}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}