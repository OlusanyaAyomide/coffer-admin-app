import { AlertTriangle, Copy, ExternalLink, Info } from 'lucide-react'
import {
  FLOW_LABELS,
  PROVIDER_LABELS,
  STATUS_BADGE_VARIANT,
  STATUS_LABELS,
  formatAmount,
  formatLatency,
} from './ledger-display'
import type { ReactNode } from 'react'
import type {
  LedgerTransaction,
  TransactionDetail,
  TransactionIntegrity,
} from '@/types/FinancialsTypes'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { formatDateToReadable } from '@/services/TimeServices'
import useFinancialsTransactionDetail from '@/hooks/useFinancialsTransactionDetail'

type TransactionDetailSheetProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: LedgerTransaction | null
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="text-sm text-foreground break-all">{children}</span>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h3 className="text-sm font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      {children}
    </section>
  )
}

/**
 * The integrity read-out.
 *
 * Deliberately renders nothing when everything is fine — a permanent green "all good" panel
 * trains people to stop reading it. It appears only when there is something to act on.
 */
function IntegrityCallouts({ integrity }: { integrity: TransactionIntegrity }) {
  const problems: Array<{ title: string; detail: string }> = []

  if (integrity.duplicate_external_reference) {
    problems.push({
      title: `Duplicate provider reference (${integrity.duplicate_count} other ${
        integrity.duplicate_count === 1 ? 'transaction' : 'transactions'
      })`,
      detail:
        'Another transaction shares this external_reference. If both completed, the user was credited twice for one provider event.',
    })
  }

  if (!integrity.has_entries) {
    problems.push({
      title: 'No ledger entries',
      detail:
        'This transaction wrote no double-entry rows, so it is invisible to every entry-based reconciliation. Expected for a pending swap; a defect once completed.',
    })
  }

  if (integrity.is_stuck) {
    problems.push({
      title: 'Stuck pending',
      detail:
        'Still pending past the expiry threshold. Funds may be stranded in pending_balance with no failure path to release them.',
    })
  }

  if (problems.length === 0) return null

  return (
    <div className="space-y-2">
      {problems.map((problem) => (
        <div
          key={problem.title}
          className="flex gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3"
        >
          <AlertTriangle className="size-4 shrink-0 text-destructive mt-0.5" />
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-destructive">
              {problem.title}
            </p>
            <p className="text-xs text-muted-foreground">{problem.detail}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * The double-entry table.
 *
 * The per-currency footer is the point of this whole panel: when debits and credits disagree
 * the delta renders destructive, so the defect is visible on the row the admin is already
 * investigating rather than on a page they would have to think to open.
 */
function EntriesTable({
  transaction,
  integrity,
}: {
  transaction: TransactionDetail
  integrity: TransactionIntegrity
}) {
  if (transaction.entries.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic">
        No ledger entries were written for this transaction.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader className="bg-brand">
            <TableRow className="hover:bg-brand">
              <TableHead className="text-white">Account</TableHead>
              <TableHead className="text-white">Direction</TableHead>
              <TableHead className="text-white text-right">Amount</TableHead>
              <TableHead className="text-white">Currency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transaction.entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell className="text-sm">{entry.account.label}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      entry.direction === 'credit' ? 'success' : 'outline'
                    }
                  >
                    {entry.direction}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-medium tabular-nums">
                  {formatAmount(entry.amount, entry.currency)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {entry.currency}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {integrity.balanced_per_currency ? (
        <div className="space-y-1.5">
          {integrity.balanced_per_currency.map((balance) => (
            <div
              key={balance.currency}
              className={cn(
                'flex items-center justify-between rounded-md border px-3 py-2 text-sm',
                balance.balanced
                  ? 'border-border bg-muted/40'
                  : 'border-destructive/40 bg-destructive/5',
              )}
            >
              <span className="font-medium">{balance.currency}</span>
              <div className="flex items-center gap-4 tabular-nums">
                <span className="text-muted-foreground">
                  Dr {formatAmount(balance.debit, balance.currency)}
                </span>
                <span className="text-muted-foreground">
                  Cr {formatAmount(balance.credit, balance.currency)}
                </span>
                <span
                  className={cn(
                    'font-semibold',
                    balance.balanced
                      ? 'text-muted-foreground'
                      : 'text-destructive',
                  )}
                >
                  Δ {formatAmount(balance.delta, balance.currency)}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex gap-2 rounded-md border border-border bg-muted/40 px-3 py-2">
          <Info className="size-4 shrink-0 text-muted-foreground mt-0.5" />
          <p className="text-xs text-muted-foreground">
            {integrity.balance_check_skipped_reason}
          </p>
        </div>
      )}
    </div>
  )
}

/** A single metadata value: URLs (e.g. Cloudinary image links) become a View link, scalars
 *  render inline, and anything nested collapses to [object] (the raw JSON below has the full
 *  shape). */
function MetadataValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <span className="italic text-muted-foreground">—</span>
  }
  if (typeof value === 'string') {
    if (/^https?:\/\//i.test(value)) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-primary hover:underline"
        >
          <ExternalLink className="size-3" />
          View
        </a>
      )
    }
    return <span className="break-all text-foreground">{value}</span>
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return <span className="text-foreground">{String(value)}</span>
  }
  // Nested object or array — the raw JSON block carries the detail.
  return <span className="italic text-muted-foreground">[object]</span>
}

function MetadataSection({ meta }: { meta: Record<string, unknown> }) {
  const entries = Object.entries(meta)
  if (entries.length === 0) return null

  return (
    <Section title="Metadata">
      <dl className="divide-y divide-border rounded-lg border border-border">
        {entries.map(([key, value]) => (
          <div
            key={key}
            className="flex items-start justify-between gap-4 px-3 py-2"
          >
            <dt className="text-xs font-medium text-muted-foreground">{key}</dt>
            <dd className="max-w-[60%] text-right text-sm">
              <MetadataValue value={value} />
            </dd>
          </div>
        ))}
      </dl>

      <details className="mt-2 rounded-lg border border-border bg-muted/40">
        <summary className="cursor-pointer px-3 py-2 text-xs text-muted-foreground">
          <Copy className="mr-2 inline size-3.5" />
          Raw meta_data
        </summary>
        <pre className="overflow-x-auto px-3 pb-3 text-xs text-muted-foreground">
          {JSON.stringify(meta, null, 2)}
        </pre>
      </details>
    </Section>
  )
}

export default function TransactionDetailSheet({
  open,
  onOpenChange,
  transaction: row,
}: TransactionDetailSheetProps) {
  const { transaction, integrity, isDetailLoading, isDetailError } =
    useFinancialsTransactionDetail(open ? (row?.id ?? null) : null)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-4xl p-0">
        <SheetHeader className="border-b border-border">
          <SheetTitle className="flex items-center gap-3">
            <span className="font-mono text-sm">{row?.reference}</span>
            {row ? (
              <Badge variant={STATUS_BADGE_VARIANT[row.status]}>
                {STATUS_LABELS[row.status]}
              </Badge>
            ) : null}
          </SheetTitle>
          <SheetDescription>
            {row
              ? `${FLOW_LABELS[row.flow]} via ${PROVIDER_LABELS[row.provider]}`
              : null}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {isDetailLoading ? (
            <p className="text-sm text-muted-foreground">
              Loading transaction…
            </p>
          ) : null}

          {isDetailError ? (
            <p className="text-sm text-destructive">
              Could not load this transaction.
            </p>
          ) : null}

          {transaction && integrity ? (
            <>
              <IntegrityCallouts integrity={integrity} />

              <Section title="Money">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Field label="Amount">
                    {formatAmount(
                      transaction.amount,
                      transaction.base_currency,
                    )}
                  </Field>
                  <Field label="Charges">
                    {formatAmount(
                      transaction.charges_total,
                      transaction.base_currency,
                    )}
                  </Field>
                  <Field label="Rate">{transaction.rate ?? '—'}</Field>
                  <Field label="Base currency">
                    {transaction.base_currency ?? '—'}
                  </Field>
                  <Field label="Quote currency">
                    {transaction.quote_currency ?? '—'}
                  </Field>
                  <Field label="Category (raw)">
                    <span className="font-mono text-xs">
                      {transaction.category}
                    </span>
                  </Field>
                </div>
              </Section>

              <Section title="Ledger entries">
                <EntriesTable transaction={transaction} integrity={integrity} />
              </Section>

              {transaction.charges.length > 0 ? (
                <Section title="Charges">
                  <div className="space-y-1.5">
                    {transaction.charges.map((charge) => (
                      <div
                        key={charge.id}
                        className="flex items-center justify-between rounded-md border border-border bg-muted/40 px-3 py-2 text-sm"
                      >
                        <span className="capitalize">
                          {charge.type.replace(/_/g, ' ')}
                        </span>
                        <span className="tabular-nums">
                          {formatAmount(charge.amount, charge.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                </Section>
              ) : null}

              <Section title="Routing">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                  <Field label="Rail">
                    {PROVIDER_LABELS[transaction.provider]}
                  </Field>
                  <Field label="Provider reference">
                    <span className="font-mono text-xs">
                      {transaction.external_reference ?? '—'}
                    </span>
                  </Field>
                  <Field label="Settled in">
                    {formatLatency(transaction.settlement_latency_proxy)}
                  </Field>
                  {transaction.destination ? (
                    <>
                      <Field label="Destination type">
                        {transaction.destination.type}
                      </Field>
                      <Field label="Destination bank">
                        {transaction.destination.bank ?? '—'}
                      </Field>
                      <Field label="Account">
                        {transaction.destination.identifier ?? '—'}
                      </Field>
                    </>
                  ) : null}
                </div>
              </Section>

              <Section title="User">
                {transaction.user ? (
                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                    <Field label="Name">
                      {[transaction.user.first_name, transaction.user.last_name]
                        .filter(Boolean)
                        .join(' ') || '—'}
                    </Field>
                    <Field label="Email">{transaction.user.email}</Field>
                    <Field label="Coffer ID">
                      <span className="font-mono text-xs">
                        {transaction.user.coffer_id}
                      </span>
                    </Field>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    No user attached. Lenco deposits are written without a
                    user_id.
                  </p>
                )}
              </Section>

              <Section title="Timeline">
                <div className="grid grid-cols-2 gap-4">
                  <Field label="Created">
                    {formatDateToReadable(transaction.created_at)}
                  </Field>
                  <Field label="Last updated">
                    {formatDateToReadable(transaction.updated_at)}
                  </Field>
                </div>
                {transaction.failure_reason ? (
                  <Field label="Failure reason">
                    <span className="text-destructive">
                      {transaction.failure_reason}
                    </span>
                  </Field>
                ) : null}
              </Section>

              {transaction.meta_data ? (
                <MetadataSection meta={transaction.meta_data} />
              ) : null}
            </>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  )
}
