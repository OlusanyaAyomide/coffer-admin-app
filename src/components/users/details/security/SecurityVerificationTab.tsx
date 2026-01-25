import { toast } from 'sonner';
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

  // Transform backend permissions to UI format
  const permissions: Array<Permission> = defaultPermissions.map(p => {
    const backendKey = permissionKeyMap[p.id];
    // If overviewData is missing, fallback to default 'enabled: true' from config, or false? 
    // DefaultPermissions has 'true'.
    const backendValue = overviewData?.data?.permissions?.[backendKey] ?? p.enabled;
    return { ...p, enabled: backendValue };
  });

  // --- Handlers (Placeholders for now) ---
  const handleForceKycRecheck = (level: number, reason: string) => {
    console.log(`Force KYC re-check from level ${level}, reason: ${reason}`);
    toast.info("Force KYC Re-check not implemented yet");
  };

  const handleReset2FA = () => {
    console.log('Reset 2FA secret');
    toast.info("Reset 2FA not implemented yet");
  };

  const handleLockAccount = () => {
    // setIsAccountLocked((prev) => !prev);
    // console.log(isAccountLocked ? 'Account unlocked' : 'Account locked');
    toast.info("Lock Account not implemented yet");
  };

  const handleViewFullLogs = () => {
    console.log('View full logs');
  };

  // derived state
  const verificationItems = overviewData?.data?.verification_state || [];
  const securityEvents = eventsData?.data || [];
  const kycNotes = overviewData?.data?.kyc_notes || [];
  const isAccountLockedData = overviewData?.data?.is_account_locked ?? false;

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
          <SecurityNotesCard notes={kycNotes} />
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
          />
        )}
      </div>
    </div>
  );
}
