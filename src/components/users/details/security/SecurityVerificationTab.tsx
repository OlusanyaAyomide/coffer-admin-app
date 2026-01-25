import VerificationStateCard from './VerificationStateCard';
import PermissionsCard from './PermissionsCard';
import AdminControlsCard from './AdminControlsCard';
import SecurityEventsTable from './SecurityEventsTable';
import SecurityNotesCard from './SecurityNotesCard';
import {
  AdminControlsSkeleton,
  PermissionsSkeleton,
  SecurityEventsSkeleton,
  SecurityNotesSkeleton,
  VerificationStateSkeleton
} from './SecurityVerificationSkeleton';
import type { Permission } from './PermissionsCard';
import type { QueryError } from '@/types/ResponseTypes';
import type {
  PermissionUpdateDto,
  SecurityEventsResponse,
  SecurityOverviewResponse
} from '@/types/UserTypes';
import useGetRequest from '@/hooks/useGetRequests';
import usePostRequest from '@/hooks/usePostRequests';
import { DEBOUNCE_IN_MS } from '@/constants/Constants';
import useDebounce from '@/hooks/useDebounce';

// Map backend permission keys to UI IDs
const permissionKeyMap: Record<string, string> = {
  withdrawals: 'can_withdraw',
  deposit: 'can_deposit',
  swap: 'can_swap',
  purchase_investment: 'can_purchase_investment',
  save: 'can_save',
};

const defaultPermissions: Array<Permission> = [
  { id: 'withdrawals', name: 'Withdrawals', description: 'Allow crypto & fiat out', enabled: true },
  { id: 'deposit', name: 'Deposit', description: 'Allow deposits to account', enabled: true },
  { id: 'swap', name: 'Swap', description: 'Allow currency swaps', enabled: true },
  { id: 'purchase_investment', name: 'Purchase Investment', description: 'Allow buying coffer plans', enabled: true },
  { id: 'save', name: 'Save', description: 'Allow savings functionality', enabled: true },
];

export default function SecurityVerificationTab({ userId }: { userId: string }) {

  const { data: overviewData, isLoading: isOverviewLoading, refetch: refetchOverview } = useGetRequest<SecurityOverviewResponse, QueryError>({
    URL: `/admin/customer/${userId}/security-overview`,
    queryKey: ['security-overview', userId],
  });

  const { data: eventsData, isLoading: isEventsLoading } = useGetRequest<SecurityEventsResponse, QueryError>({
    URL: `/admin/customer/${userId}/security-logs`,
    queryKey: ['security-logs', userId],
  });

  const { mutate: updatePermissions } = usePostRequest<void, PermissionUpdateDto>({
    URL: `/admin/customer/${userId}/permissions`,
    mutationKey: ['update-permissions', userId],
    showErrorToast: true,
    successText: 'Permissions updated successfully',
    onSuccess: () => {
      refetchOverview();
    }
  });

  const debouncedUpdate = useDebounce((dto: PermissionUpdateDto) => {
    updatePermissions(dto);
  }, DEBOUNCE_IN_MS);

  const handlePermissionToggle = (id: string, enabled: boolean) => {
    const backendKey = permissionKeyMap[id];
    if (backendKey) {
      debouncedUpdate({ [backendKey]: enabled });
    }
  };

  const permissions: Array<Permission> = defaultPermissions.map(p => {
    const backendKey = permissionKeyMap[p.id];

    const backendValue = overviewData?.data?.permissions?.[backendKey] ?? p.enabled;
    return { ...p, enabled: backendValue };
  });

  const { mutate: forceKycRecheck } = usePostRequest<void, { level: number | string; reason: string }>({
    URL: `/admin/customer/${userId}/force-kyc-recheck`,
    mutationKey: ['force-kyc-recheck', userId],
    showErrorToast: true,
    successText: 'KYC Force Re-check initiated successfully',
    onSuccess: () => {
      refetchOverview();
    }
  });

  const { mutate: toggleLockAccount } = usePostRequest<any, void>({
    URL: `/admin/customer/${userId}/toggle-lock`,
    mutationKey: ['toggle-lock', userId],
    showErrorToast: true,
    successText: 'Account lock status updated successfully',
    onSuccess: () => {
      refetchOverview();
    }
  });

  const handleForceKycRecheck = (level: string, reason: string) => {
    forceKycRecheck({ level, reason });
  };

  const { mutate: reset2FA } = usePostRequest<void, void>({
    URL: `/admin/customer/${userId}/reset-2fa`,
    mutationKey: ['reset-2fa', userId],
    showErrorToast: true,
    successText: '2FA Reset successfully',
    onSuccess: () => {
      refetchOverview();
    }
  });

  const handleReset2FA = () => {
    reset2FA();
  };

  const handleLockAccount = () => {
    toggleLockAccount();
  };

  const handleViewFullLogs = () => {
    console.log('View full logs');
  };

  // derived state
  const verificationItems = overviewData?.data?.verification_state || [];
  const securityEvents = eventsData?.data || [];
  const kycNotes = overviewData?.data?.kyc_notes || [];
  const isAccountLockedData = overviewData?.data?.is_account_locked ?? false;
  const countryCode = overviewData?.data?.country_code;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Verification & Security State */}
        {isOverviewLoading ? (
          <VerificationStateSkeleton />
        ) : (
          <VerificationStateCard items={verificationItems} syncedAt="JUST NOW" />
        )}

        {/* Recent Security Events */}
        {isEventsLoading ? (
          <SecurityEventsSkeleton />
        ) : (
          <SecurityEventsTable events={securityEvents} onViewFullLogs={handleViewFullLogs} />
        )}

        {isOverviewLoading ? (
          <SecurityNotesSkeleton />
        ) : (
          <SecurityNotesCard
            notes={kycNotes}
            userId={userId}
            latestKycSubmissionId={overviewData?.data?.latest_kyc_submission_id}
            onSuccess={refetchOverview}
          />
        )}

      </div>


      {/* Right Column - Sidebar */}
      <div className="space-y-6">
        {/* Permissions */}
        {isOverviewLoading ? (
          <PermissionsSkeleton />
        ) : (
          <PermissionsCard permissions={permissions} onToggle={handlePermissionToggle} />
        )}

        {/* Admin Controls */}
        {isOverviewLoading ? (
          <AdminControlsSkeleton />
        ) : (
          <AdminControlsCard
            onForceKycRecheck={handleForceKycRecheck}
            onReset2FA={handleReset2FA}
            onLockAccount={handleLockAccount}
            isAccountLocked={isAccountLockedData}
            countryCode={countryCode}
            currentTier={overviewData?.data?.current_tier}
            isTwoFaEnabled={overviewData?.data?.is_two_fa_enabled}
          />
        )}
      </div>
    </div>
  );
}
