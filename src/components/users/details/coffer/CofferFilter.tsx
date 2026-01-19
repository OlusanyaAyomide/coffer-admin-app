import { Filter } from 'lucide-react';
import useCofferPlansContext from './useCofferPlansContext';
import FilterButtons from '@/components/shared/FilterButtons';
import DateFilterButtons from '@/components/shared/DateFilter';
import { Button } from '@/components/ui/button';

const investmentStatusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Not Started', value: 'not_started' },
  { label: 'Matured', value: 'matured' },
  { label: 'Withdrawn', value: 'withdrawn' },
  { label: 'Cancelled', value: 'cancelled' },
];

export default function CofferFilter({ className }: { className?: string }) {
  const {
    setPage,
    investmentStatus, setInvestmentStatus,
    startDate, setStartDate,
  } = useCofferPlansContext();

  const ResetFilter = () => {
    setInvestmentStatus([]);
    setStartDate([]);
    setPage(1);
  };

  const totalFilters = [
    investmentStatus.length,
    startDate.length,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className={`${className} flex flex-wrap gap-2 pt-1 py-2`}>
      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <Filter className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">Filters</span>
        {totalFilters > 0 && (
          <span className="h-5 w-5 shrink-0 flex items-center justify-center text-xs text-white rounded-full bg-primary">
            {totalFilters}
          </span>
        )}

        <FilterButtons
          title="Status"
          filterKey="investment_status"
          filterOptions={investmentStatusOptions}
          activeFilters={investmentStatus}
          setActiveFilters={setInvestmentStatus}
        />

        <DateFilterButtons
          title="Start Date"
          filterKey="start_date"
          activeFilters={startDate}
          setActiveFilters={setStartDate}
        />

        {totalFilters > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={ResetFilter}
          >
            Reset Filters
          </Button>
        )}
      </div>
    </div>
  );
}
