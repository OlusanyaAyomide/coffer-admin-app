import type {
  AdminInvestmentStatus,
  AdminInvestmentVisibility,
} from '@/types/InvestmentTypes'
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
import { useSetInvestmentVisibility } from '@/hooks/useInvestmentActions'

type VisibilityAction = {
  target: AdminInvestmentVisibility
  label: string
  pendingLabel: string
  tooltip: string
  variant?: 'default' | 'outline' | 'destructive'
  destructive?: boolean
  confirm?: { title: string; description: string }
}

const HIDE: VisibilityAction = {
  target: 'hidden',
  label: 'Hide',
  pendingLabel: 'Hiding…',
  tooltip:
    'Take this off the marketplace so no new users can find or buy it. Existing investors keep full access, and dividends and payouts continue on schedule. Reversible at any time.',
  variant: 'outline',
}

const ARCHIVE: VisibilityAction = {
  target: 'archived',
  label: 'Archive',
  pendingLabel: 'Archiving…',
  tooltip:
    'Retire this for good: it leaves the marketplace and takes no new money. Existing investors keep full access and their payouts continue. Use Hide instead if this is temporary.',
  variant: 'outline',
  destructive: true,
  confirm: {
    title: 'Archive this investment?',
    description:
      'Archiving retires the plan for good: it leaves the marketplace and takes no new money. Existing investors keep full access and their dividends and payouts continue on schedule.',
  },
}

const SHOW: VisibilityAction = {
  target: 'visible',
  label: 'Show',
  pendingLabel: 'Showing…',
  tooltip: 'Put this back on the marketplace so users can find it again.',
  variant: 'outline',
}

const RESTORE: VisibilityAction = {
  ...SHOW,
  label: 'Restore',
  pendingLabel: 'Restoring…',
  tooltip:
    'Bring this back onto the marketplace from archived. It becomes visible to users again.',
}

/**
 * Visibility only earns its keep once a plan has started or matured. Before
 * that, the status lever is the right one and says more: unpublish returns a
 * plan to draft for editing, cancel ends it outright — hiding an awaiting_start
 * plan would be a second, vaguer way to do the same thing. An `active` plan has
 * no unpublish route (it can only mature or cancel) and a `matured` one has no
 * transitions at all, which is exactly the gap visibility was added to fill.
 */
const canDelist = (status: AdminInvestmentStatus) =>
  status === 'active' || status === 'matured'

/**
 * Re-listing is always offered, whatever the status. A plan can arrive at
 * `awaiting_start` while hidden (cancelled → draft → awaiting_start keeps the
 * flag), and without an unconditional Show it would be stranded off the
 * storefront with no way back.
 */
function actionsFor(
  visibility: AdminInvestmentVisibility,
  status: AdminInvestmentStatus,
): Array<VisibilityAction> {
  if (visibility === 'archived') return [RESTORE]
  if (visibility === 'hidden') return canDelist(status) ? [SHOW, ARCHIVE] : [SHOW]
  return canDelist(status) ? [HIDE, ARCHIVE] : []
}

export default function InvestmentVisibilityControls({
  investmentId,
  visibility,
  status,
  onChanged,
}: {
  investmentId: string
  visibility: AdminInvestmentVisibility
  status: AdminInvestmentStatus
  onChanged?: () => void
}) {
  const { setVisibility, isSettingVisibility } = useSetInvestmentVisibility({
    investmentId,
    onSuccess: onChanged,
  })

  const actions = actionsFor(visibility, status)
  if (!actions.length) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.map((action) => {
        const button = (
          <Button
            size="sm"
            variant={action.variant ?? 'default'}
            className={action.destructive ? 'text-destructive' : undefined}
            disabled={isSettingVisibility}
            onClick={
              action.confirm
                ? undefined
                : () => setVisibility({ visibility: action.target })
            }
          >
            {isSettingVisibility ? action.pendingLabel : action.label}
          </Button>
        )

        return (
          <Tooltip key={action.label}>
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
                    <AlertDialogCancel disabled={isSettingVisibility}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      // Hold the dialog open until the mutation resolves.
                      onClick={(e) => {
                        e.preventDefault()
                        setVisibility({ visibility: action.target })
                      }}
                      disabled={isSettingVisibility}
                    >
                      {isSettingVisibility ? action.pendingLabel : action.label}
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
