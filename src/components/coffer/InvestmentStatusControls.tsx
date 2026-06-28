import type { AdminInvestmentStatus } from '@/types/InvestmentTypes';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useUpdateInvestmentStatus } from '@/hooks/useInvestmentActions';

type StatusAction = {
  target: AdminInvestmentStatus;
  label: string;
  variant?: 'default' | 'outline' | 'destructive';
  confirm?: { title: string; description: string };
};

// Manual transitions allowed from each status (mirrors the backend map).
const ACTIONS: Record<AdminInvestmentStatus, Array<StatusAction>> = {
  draft: [
    { target: 'awaiting_start', label: 'Publish' },
    {
      target: 'cancelled',
      label: 'Cancel',
      variant: 'destructive',
      confirm: {
        title: 'Cancel investment?',
        description: 'This investment will no longer be available to users.',
      },
    },
  ],
  awaiting_start: [
    { target: 'draft', label: 'Unpublish', variant: 'outline' },
    {
      target: 'cancelled',
      label: 'Cancel',
      variant: 'destructive',
      confirm: {
        title: 'Cancel investment?',
        description: 'This investment will no longer be available to users.',
      },
    },
  ],
  active: [
    {
      target: 'matured',
      label: 'Mark matured',
      variant: 'outline',
      confirm: {
        title: 'Mark as matured?',
        description:
          'Marking matured ends the active period. Do this only as an override.',
      },
    },
    {
      target: 'cancelled',
      label: 'Cancel',
      variant: 'destructive',
      confirm: {
        title: 'Cancel active investment?',
        description:
          'Cancelling an active investment affects existing investors. Proceed with care.',
      },
    },
  ],
  matured: [],
  cancelled: [],
};

export default function InvestmentStatusControls({
  investmentId,
  status,
  onChanged,
}: {
  investmentId: string;
  status: AdminInvestmentStatus;
  onChanged?: () => void;
}) {
  const { updateStatus, isUpdatingStatus } = useUpdateInvestmentStatus({
    investmentId,
    onSuccess: onChanged,
  });

  const actions = ACTIONS[status] ?? [];
  if (!actions.length) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.map((action) =>
        action.confirm ? (
          <AlertDialog key={action.target}>
            <AlertDialogTrigger asChild>
              <Button
                size="sm"
                variant={action.variant ?? 'default'}
                disabled={isUpdatingStatus}
              >
                {action.label}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{action.confirm.title}</AlertDialogTitle>
                <AlertDialogDescription>
                  {action.confirm.description}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Keep</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => updateStatus({ status: action.target })}
                >
                  {action.label}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        ) : (
          <Button
            key={action.target}
            size="sm"
            variant={action.variant ?? 'default'}
            disabled={isUpdatingStatus}
            onClick={() => updateStatus({ status: action.target })}
          >
            {action.label}
          </Button>
        ),
      )}
    </div>
  );
}
