import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import type { DataTableProps } from '@/components/shared/BaseDataTable';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 rounded-full h-10 px-3 gap-1.5 text-sm font-medium"
            >
              <img src="/TableTogge.svg" alt="TableToggle" width={14} height={14} />
              Select Columns
            </Button>
          </DialogTrigger>
          <DialogContent className="w-full rounded-3xl max-md:hidden max-w-[572px] overflow-x-hidden overflow-auto max-h-[90vh] p-6 bg-card border-border">
            <div className="flex mt-4 items-center justify-between mb-2">
              <DialogTitle className="font-semibold text-xl text-popover-foreground">
                Select Columns
              </DialogTitle>
              <Button
                onClick={handleSelectAll}
                variant="ghost"
                size={"sm"}
                className="px-3 h-8 text-sm font-medium text-primary hover:text-primary hover:bg-primary/10"
              >
                {!excludedFields.length ? 'Unselect all' : 'Select all'}
              </Button>
              <DialogDescription className="sr-only">
                Choose which columns to display in the table
              </DialogDescription>
            </div>
            {/* Reset to Default button */}
            {!isDefaultState() && (
              <Button
                onClick={handleResetToDefault}
                variant="ghost"
                size="sm"
                className="mb-4 px-0 h-auto text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-transparent"
              >
                Reset to Default
              </Button>
            )}
            <div className="flex flex-col gap-4 mb-6">
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
                      className="h-[18px] w-[18px] data-[state=checked]:bg-primary data-[state=checked]:border-primary"
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
            <DialogClose asChild>
              <Button className="rounded-full ml-auto px-6 h-10 bg-primary hover:bg-primary/90 text-primary-foreground">
                <span className="font-medium text-sm w-[80px]">Done</span>
              </Button>
            </DialogClose>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div>
        <BaseDataTable
          columns={filteredColumns}
          setPage={setPage}
          data={data}
          meta={meta}
        />
      </div>
    </div>
  );
}