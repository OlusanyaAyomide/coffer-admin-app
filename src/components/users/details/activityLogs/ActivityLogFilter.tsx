import { Filter } from 'lucide-react';
import useActivityLogContext from './useActivityLogContext';
import FilterButtons from '@/components/shared/FilterButtons';
import DateFilterButtons from '@/components/shared/DateFilter';
import { Button } from '@/components/ui/button';

const activityTypeOptions = [
  { label: 'Login', value: 'login' },
  { label: 'Logout', value: 'logout' },
  { label: 'Password Change', value: 'password_change' },
  { label: 'Profile Update', value: 'profile_update' },
  { label: 'KYC Submission', value: 'kyc_submission' },
  { label: 'Transaction', value: 'transaction' },
  { label: '2FA Enabled', value: '2fa_enabled' },
  { label: '2FA Disabled', value: '2fa_disabled' },
  { label: 'Device Added', value: 'device_added' },
  { label: 'Device Removed', value: 'device_removed' },
  { label: 'Withdrawal Request', value: 'withdrawal_request' },
  { label: 'API Key Created', value: 'api_key_created' },
];

export default function ActivityLogFilter({ className }: { className?: string }) {
  const {
    setPage,
    activityType, setActivityType,
    duration, setDuration,
  } = useActivityLogContext();

  const ResetFilter = () => {
    setActivityType([]);
    setDuration([]);
    setPage(1);
  };

  const totalFilters = [
    activityType.length,
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
          title="Type"
          filterKey="activity_type"
          filterOptions={activityTypeOptions}
          activeFilters={activityType}
          setActiveFilters={setActivityType}
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
