import { AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KycActionButtonsProps {
  onApprove: () => void;
  onReject: () => void;
  onRequestInfo: () => void;
}

export default function KycActionButtons({
  onApprove,
  onReject,
  onRequestInfo,
}: KycActionButtonsProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      {/* Action Buttons */}
      <div className="space-y-2">
        <Button
          className="w-full bg-green-600 hover:bg-green-700 text-white"
          onClick={onApprove}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Approve KYC
        </Button>

        <Button
          variant="outline"
          className="w-full border-red-500/50 text-red-500 hover:bg-red-500/10 hover:text-red-500"
          onClick={onReject}
        >
          <XCircle className="h-4 w-4 mr-2" />
          Reject KYC
        </Button>

        <Button
          variant="outline"
          className="w-full border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 hover:text-yellow-500"
          onClick={onRequestInfo}
        >
          <AlertTriangle className="h-4 w-4 mr-2" />
          Request More Info
        </Button>
      </div>
    </div>
  );
}
