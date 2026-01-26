import { Filter } from 'lucide-react';
import useKycListContext from './useKycListContext';
import FilterButtons from '@/components/shared/FilterButtons';
import DateFilterButtons from '@/components/shared/DateFilter';
import ComboBoxFilter from '@/components/shared/ComboBoxFilter';
import { Button } from '@/components/ui/button';
import useCountrySearch from '@/hooks/useCountrySearch';
import useFilterSearchParam from '@/hooks/useFilterSearchParam';

const kycStatusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'More Info Requested', value: 'more_info_requested' },
];

const kycBandOptions = [
  { label: 'Band A', value: 'band_a' },
  { label: 'Band B', value: 'band_b' },
  { label: 'Band C', value: 'band_c' },
];

export default function KycFilter({ className }: { className?: string }) {
  const {
    setPage,
    kycStatus, setKycStatus,
    kycBand, setKycBand,
    country, setCountry,
    duration, setDuration,
  } = useKycListContext();

  const { resetParams } = useFilterSearchParam();

  const {
    countrySuggestions,
    setCountrySearchResult,
    isCountrySearchLoading,
  } = useCountrySearch();

  const ResetFilter = () => {
    setKycStatus([]);
    setKycBand([]);
    setCountry([]);
    setDuration([]);
    setPage(1);
    resetParams()
  };

  const totalFilters = [
    kycStatus.length,
    kycBand.length,
    country.length,
    duration.length,
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
          title="KYC Status"
          filterKey="kyc_status"
          filterOptions={kycStatusOptions}
          activeFilters={kycStatus}
          setActiveFilters={setKycStatus}
        />

        <FilterButtons
          title="KYC Band"
          filterKey="kyc_band"
          filterOptions={kycBandOptions}
          activeFilters={kycBand}
          setActiveFilters={setKycBand}
        />

        <ComboBoxFilter
          title="Country"
          filterKey="country"
          filterOptions={countrySuggestions}
          activeFilters={country}
          setActiveFilters={setCountry}
          setSearchResult={setCountrySearchResult}
          isPending={isCountrySearchLoading}
        />

        <DateFilterButtons
          title="Duration"
          filterKey="duration"
          activeFilters={duration}
          setActiveFilters={setDuration}
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

