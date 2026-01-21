

import type { KycBand } from '../KycViewPage';
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

interface ApproveKycDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  userName: string;
  requestingBand: KycBand;
}

const getBandLabel = (band: KycBand): string => {
  switch (band) {
    case 'band_a':
      return 'Band A';
    case 'band_b':
      return 'Band B';
    case 'band_c':
      return 'Band C';
    default:
      return band;
  }
};

export default function ApproveKycDialog({
  open,
  onOpenChange,
  onConfirm,
  userName,
  requestingBand,
}: ApproveKycDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve KYC Submission</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to approve <strong>{userName}'s</strong> KYC submission?
            They will be upgraded to <strong>{getBandLabel(requestingBand)}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-green-600 hover:bg-green-700"
          >
            Approve
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
