import { Filter } from 'lucide-react';
import useActivityLogContext from './useActivityLogContext';
import FilterButtons from '@/components/shared/FilterButtons';
import DateFilterButtons from '@/components/shared/DateFilter';
import { Button } from '@/components/ui/button';

const activityTypeOptions = [
  { label: 'Login', value: 'log_in' },
  { label: 'Logout', value: 'log_out' },
  { label: 'Transfer', value: 'transfer' },
  { label: 'Swap', value: 'swap' },
  { label: 'Deposit', value: 'deposit' },
  { label: 'Withdrawal', value: 'withdrawal' },
  { label: 'Reset Password', value: 'reset_password' },
  { label: 'New Device Sign In', value: 'new_device_sign_in' },
  { label: '2FA Sign In', value: 'two_fa_sign_in' },
  { label: 'Audit Log', value: 'audit_log' },
  { label: 'Sign Up', value: 'sign_up' },
  { label: 'Email Verified', value: 'email_verified' },
  { label: 'Profile Update', value: 'profile_update' },
  { label: 'Biometric Login', value: 'biometric_login' },
  { label: 'Deposit Complete', value: 'deposit_complete' },
  { label: 'Withdrawal Complete', value: 'withdrawal_complete' },
  { label: 'Swap Complete', value: 'swap_complete' },
  { label: '2FA Setup', value: 'two_fa_setup' },
  { label: 'Investment Purchase', value: 'investment_purchase' },
  { label: 'Investment Withdrawal', value: 'investment_withdrawal' },
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
