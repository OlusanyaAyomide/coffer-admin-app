import { useState } from 'react';
import VerificationStateCard from './VerificationStateCard';
import PermissionsCard from './PermissionsCard';
import AdminControlsCard from './AdminControlsCard';
import SecurityEventsTable from './SecurityEventsTable';
import LatestNoteCard from './LatestNoteCard';
import type {SecurityEvent} from './SecurityEventsTable';
import type {Permission} from './PermissionsCard';
import type {AdminNote} from './LatestNoteCard';
import type {VerificationItem} from './VerificationItemCard';

// Mock data for verification items
const mockVerificationItems: Array<VerificationItem> = [
  {
    id: 'kyc',
    title: 'KYC Status',
    tierBadge: 'Tier 3 Verified',
    status: 'verified',
    statusLabel: 'Verified',
    description: 'Full identity verification completed. Documents are valid until Oct 2025.',
    icon: 'kyc',
  },
  {
    id: 'email',
    title: 'Email Verification',
    status: 'verified',
    statusLabel: 'Verified',
    description: 'alex.sterling@example.com',
    icon: 'email',
  },
  {
    id: '2fa',
    title: '2-Factor Authentication',
    status: 'enabled',
    statusLabel: 'Enabled',
    description: 'Google Authenticator linked on Oct 24, 2023',
    icon: '2fa',
    date: '2023-10-24T00:00:00Z',
  },
];

// Mock data for permissions - Updated as per user request
const initialPermissions: Array<Permission> = [
  {
    id: 'withdrawals',
    name: 'Withdrawals',
    description: 'Allow crypto & fiat out',
    enabled: true,
  },
  {
    id: 'deposit',
    name: 'Deposit',
    description: 'Allow deposits to account',
    enabled: true,
  },
  {
    id: 'swap',
    name: 'Swap',
    description: 'Allow currency swaps',
    enabled: true,
  },
  {
    id: 'purchase_investment',
    name: 'Purchase Investment',
    description: 'Allow buying coffer plans',
    enabled: true,
  },
  {
    id: 'save',
    name: 'Save',
    description: 'Allow savings functionality',
    enabled: false,
  },
];

// Mock data for security events
const mockSecurityEvents: Array<SecurityEvent> = [
  {
    id: '1',
    event: 'Login Successful',
    ipAddress: '192.168.1.1',
    dateTime: '2026-01-19T10:42:00Z',
    status: 'success',
  },
  {
    id: '2',
    event: '2FA Enabled',
    ipAddress: '192.168.1.1',
    dateTime: '2023-10-24T09:15:00Z',
    status: 'completed',
  },
  {
    id: '3',
    event: 'Password Changed',
    ipAddress: '88.21.14.22',
    dateTime: '2023-10-20T16:30:00Z',
    status: 'success',
  },
];

// Mock data for latest note
const mockLatestNote: AdminNote = {
  id: '1',
  adminName: 'Sarah Admin',
  adminInitials: 'S',
  date: '2023-11-12T00:00:00Z',
  content: 'User requested withdrawal limit increase. Approved based on tenure.',
};

export default function SecurityVerificationTab() {
  const [permissions, setPermissions] = useState(initialPermissions);
  const [isAccountLocked, setIsAccountLocked] = useState(false);

  const handlePermissionToggle = (id: string, enabled: boolean) => {
    setPermissions((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled } : p))
    );
    // TODO: API call to update permission
    console.log(`Permission ${id} set to ${enabled}`);
  };

  const handleForceKycRecheck = (level: number, reason: string) => {
    // TODO: API call to force KYC re-check
    console.log(`Force KYC re-check from level ${level}, reason: ${reason}`);
  };

  const handleReset2FA = () => {
    // TODO: API call to reset 2FA
    console.log('Reset 2FA secret');
  };

  const handleLockAccount = () => {
    setIsAccountLocked((prev) => !prev);
    // TODO: API call to lock/unlock account
    console.log(isAccountLocked ? 'Account unlocked' : 'Account locked');
  };

  const handleViewFullLogs = () => {
    // TODO: Navigate to full logs page
    console.log('View full logs');
  };

  const handleViewAllNotes = () => {
    // TODO: Navigate to all notes or open modal
    console.log('View all notes');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column - Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {/* Verification & Security State */}
        <VerificationStateCard items={mockVerificationItems} syncedAt="1 MIN AGO" />

        {/* Recent Security Events */}
        <SecurityEventsTable events={mockSecurityEvents} onViewFullLogs={handleViewFullLogs} />
      </div>

      {/* Right Column - Sidebar */}
      <div className="space-y-6">
        {/* Permissions */}
        <PermissionsCard permissions={permissions} onToggle={handlePermissionToggle} />

        {/* Admin Controls */}
        <AdminControlsCard
          onForceKycRecheck={handleForceKycRecheck}
          onReset2FA={handleReset2FA}
          onLockAccount={handleLockAccount}
          isAccountLocked={isAccountLocked}
        />

        {/* Latest Note */}
        <LatestNoteCard note={mockLatestNote} onViewAllNotes={handleViewAllNotes} />
      </div>
    </div>
  );
}
