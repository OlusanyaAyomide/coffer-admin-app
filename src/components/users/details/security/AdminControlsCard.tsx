import { useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { AlertCircle, ChevronRight, Key, Lock, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { cn } from '@/lib/utils';
import TextAreaInput from '@/components/shared/TextAreaInput';
import RequiredLabel from '@/components/shared/RequiredLabel';
import { validateRequiredString } from '@/services/ValidationServices';

interface AdminControlsCardProps {
  onForceKycRecheck: (level: number, reason: string) => void;
  onReset2FA: () => void;
  onLockAccount: () => void;
  isAccountLocked?: boolean;
}

type DialogType = 'kyc' | '2fa' | 'lock' | null;

interface KycFormData {
  reason: string;
}

const kycFormSchema = yup.object({
  reason: validateRequiredString('Reason is required'),
});

export default function AdminControlsCard({
  onForceKycRecheck,
  onReset2FA,
  onLockAccount,
  isAccountLocked = false,
}: AdminControlsCardProps) {
  const [activeDialog, setActiveDialog] = useState<DialogType>(null);
  const [selectedKycLevel, setSelectedKycLevel] = useState<string>('1');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<KycFormData>({
    resolver: yupResolver(kycFormSchema),
    defaultValues: {
      reason: '',
    },
  });

  const handleKycConfirm = (data: KycFormData) => {
    onForceKycRecheck(parseInt(selectedKycLevel), data.reason);
    setActiveDialog(null);
    setSelectedKycLevel('1');
    reset();
  };

  const handleCloseKycDialog = () => {
    setActiveDialog(null);
    setSelectedKycLevel('1');
    reset();
  };

  const handle2FAConfirm = () => {
    onReset2FA();
    setActiveDialog(null);
  };

  const handleLockConfirm = () => {
    onLockAccount();
    setActiveDialog(null);
  };

  return (
    <>
      <div className="rounded-lg border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <h3 className="text-base font-semibold">Admin Controls</h3>
        </div>

        <div className="space-y-2">
          {/* Force KYC Re-check */}
          <Button
            variant="ghost"
            className="w-full justify-between h-11 px-3 hover:bg-muted"
            onClick={() => setActiveDialog('kyc')}
          >
            <div className="flex items-center gap-3">
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Force KYC Re-check</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Button>

          {/* Reset 2FA Secret */}
          <Button
            variant="ghost"
            className="w-full justify-between h-11 px-3 hover:bg-muted"
            onClick={() => setActiveDialog('2fa')}
          >
            <div className="flex items-center gap-3">
              <Key className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Reset 2FA Secret</span>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Button>

          {/* Lock Account */}
          <Button
            variant="ghost"
            className={cn(
              'w-full justify-center h-11 px-3 mt-2',
              isAccountLocked
                ? 'bg-green-500/10 text-green-600 hover:bg-green-500/20 hover:text-green-600'
                : 'bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive'
            )}
            onClick={() => setActiveDialog('lock')}
          >
            <Lock className="h-4 w-4 mr-2" />
            <span className="text-sm font-medium">
              {isAccountLocked ? 'Unlock Account' : 'Lock Account'}
            </span>
          </Button>
        </div>
      </div>

      {/* Force KYC Dialog */}
      <AlertDialog open={activeDialog === 'kyc'} onOpenChange={(open) => !open && handleCloseKycDialog()}>
        <AlertDialogContent className="max-w-md overflow-auto">
          <div>
            <AlertDialogHeader className=''>
              <AlertDialogTitle>Force KYC Re-check</AlertDialogTitle>
              <AlertDialogDescription>
                Select the KYC level to reset for this user. They will need to re-verify from this level.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <form onSubmit={handleSubmit(handleKycConfirm)} className='mt-4'>
              <RadioGroup value={selectedKycLevel} onValueChange={setSelectedKycLevel} className="mb-4">
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="1" id="level-1" />
                  <div className="flex-1 cursor-pointer">
                    <span className="font-medium">Level 1</span>
                    <span className="text-xs text-muted-foreground ml-2">- Basic Identity</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="2" id="level-2" />
                  <div className="flex-1 cursor-pointer">
                    <span className="font-medium">Level 2</span>
                    <span className="text-xs text-muted-foreground ml-2">- Address Proof</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                  <RadioGroupItem value="3" id="level-3" />
                  <div className="flex-1 cursor-pointer">
                    <span className="font-medium">Level 3</span>
                    <span className="text-xs text-muted-foreground ml-2">- Advanced Due Diligence</span>
                  </div>
                </div>
              </RadioGroup>

              <div className="mb-2">
                <RequiredLabel>Reason for Re-check</RequiredLabel>
                <TextAreaInput
                  fieldName="reason"
                  register={register}
                  error={errors.reason?.message}
                  placeHolderText="Enter the reason for forcing KYC re-check..."
                  showPlaceholder
                  className="h-[120px] max-h-[180px]"
                  containerClassName="mb-0"
                />
              </div>

              <AlertDialogFooter className="mt-4">
                <AlertDialogCancel type="button" onClick={handleCloseKycDialog}>Cancel</AlertDialogCancel>
                <Button type="submit" className="min-w-[140px]">Force Reset</Button>
              </AlertDialogFooter>
            </form>
          </div>

        </AlertDialogContent>
      </AlertDialog>

      {/* Reset 2FA Dialog */}
      <AlertDialog open={activeDialog === '2fa'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset 2FA Secret</AlertDialogTitle>
            <AlertDialogDescription>
              This will invalidate the user's current 2FA setup. They will need to set up two-factor authentication again on their next login. Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handle2FAConfirm} className="bg-destructive hover:bg-destructive/90">
              Reset 2FA
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lock Account Dialog */}
      <AlertDialog open={activeDialog === 'lock'} onOpenChange={(open) => !open && setActiveDialog(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isAccountLocked ? 'Unlock Account' : 'Lock Account'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isAccountLocked
                ? 'This will restore full access to the user\'s account. They will be able to log in and perform transactions again.'
                : 'This will prevent the user from logging in and performing any transactions. The user will be notified via email.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLockConfirm}
              className={cn(
                isAccountLocked
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-destructive hover:bg-destructive/90'
              )}
            >
              {isAccountLocked ? 'Unlock Account' : 'Lock Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
