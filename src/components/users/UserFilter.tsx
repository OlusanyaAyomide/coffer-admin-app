import useUserListContext from './useUserListContext';
import FilterButtons from '@/components/shared/FilterButtons';
import DateFilterButtons from '@/components/shared/DateFilter';
import ComboBoxFilter from '@/components/shared/ComboBoxFilter';
import { Button } from '@/components/ui/button';
import useFilterSearchParam from '@/hooks/useFilterSearchParam';
import { Filter } from 'lucide-react';
import { useState } from 'react';
import { countryOptions } from '@/static/usersMockData';

const kycStatusOptions = [
  { label: 'Verified', value: 'verified' },
  { label: 'Pending', value: 'pending' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Not Started', value: 'not_started' },
];

const accountStatusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Suspended', value: 'suspended' },
  { label: 'Inactive', value: 'inactive' },
];

const riskLevelOptions = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

export default function UserFilter({ className }: { className?: string }) {
  const {
    setPage,
    kycStatus, setKycStatus,
    accountStatus, setAccountStatus,
    riskLevel, setRiskLevel,
    country, setCountry,
    joinedAt, setJoinedAt,
  } = useUserListContext();

  const { resetParams } = useFilterSearchParam();
  const [countrySearchTerm, setCountrySearchTerm] = useState('');

  const filteredCountryOptions = countryOptions.filter(
    (c) => c.label.toLowerCase().includes(countrySearchTerm.toLowerCase())
  );

  const ResetFilter = () => {
    setKycStatus([]);
    setAccountStatus([]);
    setRiskLevel([]);
    setCountry([]);
    setJoinedAt([]);
    setPage(1);
    resetParams();
  };

  const totalFilters = [
    kycStatus.length,
    accountStatus.length,
    riskLevel.length,
    country.length,
    joinedAt.length,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className={`${className} flex flex-wrap gap-2 pt-1`}>
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
          title="Account Status"
          filterKey="account_status"
          filterOptions={accountStatusOptions}
          activeFilters={accountStatus}
          setActiveFilters={setAccountStatus}
        />

        <FilterButtons
          title="Risk Level"
          filterKey="risk_level"
          filterOptions={riskLevelOptions}
          activeFilters={riskLevel}
          setActiveFilters={setRiskLevel}
        />

        <ComboBoxFilter
          title="Country"
          filterKey="country"
          filterOptions={filteredCountryOptions}
          activeFilters={country}
          setActiveFilters={setCountry}
          setSearchResult={setCountrySearchTerm}
          isPending={false}
        />

        <DateFilterButtons
          title="Joined At"
          filterKey="joined_at"
          activeFilters={joinedAt}
          setActiveFilters={setJoinedAt}
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
