import type { AdminInvestmentStatus } from '@/types/InvestmentTypes'
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
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { useUpdateInvestmentStatus } from '@/hooks/useInvestmentActions'

type StatusAction = {
  target: AdminInvestmentStatus
  label: string
  tooltip: string
  variant?: 'default' | 'outline' | 'destructive'
  confirm?: { title: string; description: string }
}

const CANCEL_TOOLTIP =
  'End this investment for good. It leaves the marketplace and can never take new money. Prefer Unpublish if you only need it off the marketplace for now.'

// Manual transitions allowed from each status (mirrors the backend map).
const ACTIONS: Record<AdminInvestmentStatus, Array<StatusAction>> = {
  draft: [
    {
      target: 'awaiting_start',
      label: 'Publish',
      tooltip:
        'Put this on the marketplace so users can start investing. It stays awaiting start until its start date, when it activates automatically.',
    },
    {
      target: 'cancelled',
      label: 'Cancel',
      variant: 'destructive',
      tooltip: CANCEL_TOOLTIP,
      confirm: {
        title: 'Cancel investment?',
        description: 'This investment will no longer be available to users.',
      },
    },
  ],
  awaiting_start: [
    {
      target: 'draft',
      label: 'Unpublish',
      variant: 'outline',
      tooltip:
        'Take this back to draft: it leaves the marketplace and can be edited, then published again. This is how you pull an investment that has not started yet.',
    },
    {
      target: 'cancelled',
      label: 'Cancel',
      variant: 'destructive',
      tooltip: CANCEL_TOOLTIP,
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
      tooltip:
        'End the active period now and treat the investment as complete. An override — normally a plan matures on its own at its maturity date.',
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
      tooltip:
        'End this investment for good. It already has investors, so cancelling affects real money — use Hide if you only need it off the marketplace.',
      confirm: {
        title: 'Cancel active investment?',
        description:
          'Cancelling an active investment affects existing investors. Proceed with care.',
      },
    },
  ],
  matured: [],
  cancelled: [
    {
      target: 'draft',
      label: 'Restore',
      variant: 'outline',
      tooltip:
        'Move this back to draft so it can be reviewed, edited, and published again.',
      confirm: {
        title: 'Restore investment?',
        description:
          'This moves the investment back to draft so it can be reviewed and published again.',
      },
    },
  ],
}

export default function InvestmentStatusControls({
  investmentId,
  status,
  hasInvestors = false,
  onChanged,
}: {
  investmentId: string
  status: AdminInvestmentStatus
  hasInvestors?: boolean
  onChanged?: () => void
}) {
  const { updateStatus, isUpdatingStatus } = useUpdateInvestmentStatus({
    investmentId,
    onSuccess: onChanged,
  })

  // An investment with investors can never return to draft (mirrors the backend guard).
  const actions = (ACTIONS[status] ?? []).filter(
    (action) => !(hasInvestors && action.target === 'draft'),
  )
  if (!actions.length) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.map((action) => {
        const button = (
          <Button
            size="sm"
            variant={action.variant ?? 'default'}
            disabled={isUpdatingStatus}
            onClick={
              action.confirm
                ? undefined
                : () => updateStatus({ status: action.target })
            }
          >
            {action.label}
          </Button>
        )

        return (
          <Tooltip key={action.target}>
            {action.confirm ? (
              <AlertDialog>
                <TooltipTrigger asChild>
                  <AlertDialogTrigger asChild>{button}</AlertDialogTrigger>
                </TooltipTrigger>
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
              <TooltipTrigger asChild>{button}</TooltipTrigger>
            )}
            <TooltipContent>{action.tooltip}</TooltipContent>
          </Tooltip>
        )
      })}
    </div>
  )
}
