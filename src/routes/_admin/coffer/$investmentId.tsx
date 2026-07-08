import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import {
  Coins,
  Download,
  FileText,
  ImageIcon,
  Pencil,
  Star,
  TrendingUp,
  Trash2,
  Users,
} from 'lucide-react'
import { PhotoProvider, PhotoView } from 'react-photo-view'
import 'react-photo-view/dist/react-photo-view.css'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
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
import HeaderNavButton from '@/components/shared/HeaderNavButton'
import {
  DIVIDEND_FREQUENCY_LABELS,
  DIVIDEND_TYPE_LABELS,
  RETURN_PAYOUT_STRATEGY_LABELS,
  formatDate,
  formatMoney,
  INVESTMENT_STATUS_LABELS,
  investmentStatusBadgeVariant,
} from '@/lib/cofferFormat'
import useAdminInvestmentDetail from '@/hooks/useAdminInvestmentDetail'
import {
  useDeleteInvestment,
  useSetInvestmentFeatured,
  useUpdateInvestmentScheduleDates,
} from '@/hooks/useInvestmentActions'
import InvestmentFormSheet from '@/components/coffer/InvestmentFormSheet'
import InvestmentStatusControls from '@/components/coffer/InvestmentStatusControls'
import InvestorTable from '@/components/coffer/InvestorTable'
import DatePicker from '@/components/shared/DatePicker'
import type { AdminDividendSchedule } from '@/types/InvestmentTypes'

export const Route = createFileRoute('/_admin/coffer/$investmentId')({
  component: InvestmentDetailPage,
})

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  )
}

function toDateInput(value: string | null | undefined): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function formatPercent(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return '—'
  return `${Number(value.toFixed(2))}%`
}

function startOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

function toScheduleDate(value: string | null | undefined): Date | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return startOfDay(date)
}

function findPreviousDistinctScheduleDate(
  dates: Array<Date | null>,
  index: number,
): Date {
  const current = dates[index] ?? startOfDay(new Date())
  const currentTime = current.getTime()
  for (let i = index - 1; i >= 0; i -= 1) {
    const candidate = dates[i]
    if (candidate && candidate.getTime() !== currentTime) return candidate
  }
  return current
}

function findNextDistinctScheduleDate(
  dates: Array<Date | null>,
  index: number,
): Date {
  const current = dates[index] ?? startOfDay(new Date())
  const currentTime = current.getTime()
  for (let i = index + 1; i < dates.length; i += 1) {
    const candidate = dates[i]
    if (candidate && candidate.getTime() !== currentTime) return candidate
  }
  return current
}

function getScheduleDateBounds(
  schedules: Array<AdminDividendSchedule>,
  scheduleId: string,
): { minDate: Date; maxDate: Date } | null {
  const index = schedules.findIndex((schedule) => schedule.id === scheduleId)
  if (index < 0) return null

  const dates = schedules.map((schedule) =>
    toScheduleDate(schedule.payment_date),
  )
  return {
    minDate: findPreviousDistinctScheduleDate(dates, index),
    maxDate: findNextDistinctScheduleDate(dates, index),
  }
}

function InvestmentDetailPage() {
  const { investmentId } = Route.useParams()
  const navigate = useNavigate()
  const { investment, isDetailLoading, isDetailError, refetchDetail } =
    useAdminInvestmentDetail({ investmentId })

  const { deleteInvestment, isDeletingInvestment } = useDeleteInvestment({
    investmentId,
    onSuccess: () => navigate({ to: '/coffer/marketplace' }),
  })
  const { setFeatured, isSettingFeatured } = useSetInvestmentFeatured({
    investmentId,
    onSuccess: refetchDetail,
  })
  const [scheduleEditId, setScheduleEditId] = useState<string | null>(null)
  const [scheduleEditDate, setScheduleEditDate] = useState('')
  const [scheduleEditError, setScheduleEditError] = useState('')
  const { updateScheduleDates, isUpdatingScheduleDates } =
    useUpdateInvestmentScheduleDates({
      investmentId,
      onSuccess: () => {
        closeScheduleDateEdit()
        refetchDetail()
      },
    })

  const activeSchedule =
    investment?.dividend_schedules.find(
      (schedule) => schedule.id === scheduleEditId,
    ) ?? null
  const activeScheduleBounds =
    investment && activeSchedule
      ? getScheduleDateBounds(investment.dividend_schedules, activeSchedule.id)
      : null

  function openScheduleDateEdit(schedule: AdminDividendSchedule) {
    if (schedule.is_processed) return
    setScheduleEditId(schedule.id)
    setScheduleEditDate(toDateInput(schedule.payment_date))
    setScheduleEditError('')
  }

  function closeScheduleDateEdit() {
    setScheduleEditId(null)
    setScheduleEditDate('')
    setScheduleEditError('')
  }

  function isScheduleEditWithinBounds(value: string): boolean {
    if (!activeScheduleBounds) return false
    const selected = toScheduleDate(value)
    if (!selected) return false

    return (
      selected.getTime() >=
        startOfDay(activeScheduleBounds.minDate).getTime() &&
      selected.getTime() <= startOfDay(activeScheduleBounds.maxDate).getTime()
    )
  }

  function saveScheduleDateEdit() {
    if (!activeSchedule || !activeScheduleBounds) return
    if (!scheduleEditDate) {
      setScheduleEditError('Choose a new payout date.')
      return
    }
    if (!isScheduleEditWithinBounds(scheduleEditDate)) {
      setScheduleEditError(
        `Choose a date between ${formatDate(
          activeScheduleBounds.minDate.toISOString(),
        )} and ${formatDate(activeScheduleBounds.maxDate.toISOString())}.`,
      )
      return
    }

    updateScheduleDates({
      schedules: [
        {
          id: activeSchedule.id,
          payment_date: scheduleEditDate,
        },
      ],
    })
  }

  const canEdit = investment && investment.status !== 'matured'
  const canDelete =
    investment &&
    investment.units_sold === 0 &&
    (investment.status === 'draft' || investment.status === 'cancelled')

  const statCards = investment
    ? [
        {
          title: 'CAPITAL RAISED',
          value: formatMoney(
            Number(investment.price_per_unit) * investment.units_sold,
            investment.currency,
          ),
          icon: Coins,
          iconColor: 'bg-primary/10 text-primary',
        },
        {
          title: 'UNITS SOLD',
          value: `${investment.units_sold} / ${investment.total_units}`,
          icon: TrendingUp,
          iconColor: 'bg-green-500/10 text-green-500',
        },
        {
          title: 'TOTAL RETURN',
          value: `${investment.roi_percentage}%`,
          icon: TrendingUp,
          iconColor: 'bg-indigo-500/10 text-indigo-500',
        },
        {
          title: 'INVESTORS',
          value: String(investment._count?.user_investments ?? 0),
          icon: Users,
          iconColor: 'bg-orange-500/10 text-orange-500',
        },
      ]
    : []

  const cover =
    investment?.images.find((i) => i.is_primary)?.document
      ?.temporary_signed_url ??
    investment?.images[0]?.document?.temporary_signed_url ??
    null

  return (
    <div className="space-y-6 pb-10">
      <HeaderNavButton>
        {investment && (
          <div className="flex flex-wrap items-center justify-end gap-2">
            <InvestmentStatusControls
              investmentId={investment.id}
              status={investment.status}
              onChanged={refetchDetail}
            />
            <Button
              variant={investment.is_featured ? 'default' : 'outline'}
              className="gap-2"
              disabled={isSettingFeatured}
              onClick={() =>
                setFeatured({ is_featured: !investment.is_featured })
              }
            >
              <Star
                className={`h-4 w-4 ${investment.is_featured ? 'fill-current' : ''}`}
              />
              {investment.is_featured ? 'Featured' : 'Feature'}
            </Button>
            {canEdit && (
              <InvestmentFormSheet
                investment={investment}
                onSaved={() => refetchDetail()}
                trigger={
                  <Button variant="outline" className="gap-2">
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                }
              />
            )}
            {canDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={isDeletingInvestment}
                    aria-label="Delete investment"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete investment?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently removes the investment. Only possible
                      while it has no investors.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => deleteInvestment(undefined)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        )}
      </HeaderNavButton>

      {isDetailError ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center">
          <p className="text-foreground">Could not load this investment.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            It may have been removed or the link is invalid.
          </p>
        </div>
      ) : isDetailLoading || !investment ? (
        <div className="flex gap-4">
          <Skeleton className="h-20 w-28 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-7 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
              {cover ? (
                <PhotoProvider>
                  <PhotoView src={cover}>
                    <img
                      src={cover}
                      alt=""
                      className="h-full w-full cursor-zoom-in object-cover"
                    />
                  </PhotoView>
                </PhotoProvider>
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-medium text-foreground">
                  {investment.title}
                </h1>
                <Badge
                  variant={investmentStatusBadgeVariant(investment.status)}
                >
                  {INVESTMENT_STATUS_LABELS[investment.status]}
                </Badge>
                {investment.is_featured && (
                  <Badge variant="secondary" className="gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Featured
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {investment.category?.name ?? 'Uncategorised'}
                {investment.sub_category
                  ? ` · ${investment.sub_category.name}`
                  : ''}
                {' · '}
                {investment.currency}
              </p>
            </div>
          </div>

          {/* Stat cards */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statCards.map((stat) => (
              <Card key={stat.title}>
                <CardContent className="flex items-center gap-3 p-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.iconColor}`}
                  >
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground">
                      {stat.title}
                    </p>
                    <p className="truncate font-medium text-foreground">
                      {stat.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="media">Media &amp; documents</TabsTrigger>
              <TabsTrigger value="dividends">Dividends</TabsTrigger>
              <TabsTrigger value="investors">Investors</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6 pt-4">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                  <CardContent className="p-5">
                    <h3 className="mb-2 text-sm font-semibold text-foreground">
                      Key details
                    </h3>
                    <Separator />
                    <DetailRow
                      label="Price per unit"
                      value={formatMoney(
                        investment.price_per_unit,
                        investment.currency,
                      )}
                    />
                    <DetailRow
                      label="Total units"
                      value={String(investment.total_units)}
                    />
                    <DetailRow
                      label="Min / max per user"
                      value={`${investment.minimum_units_purchasable} / ${
                        investment.maximum_units_purchasable ?? '∞'
                      }`}
                    />
                    <DetailRow
                      label="Return payout"
                      value={
                        RETURN_PAYOUT_STRATEGY_LABELS[
                          investment.return_payout_strategy
                        ]
                      }
                    />
                    {investment.return_payout_strategy ===
                      'upfront_and_recurring' && (
                      <DetailRow
                        label="Upfront return"
                        value={`${
                          investment.upfront_return_percentage ?? '—'
                        }% of capital`}
                      />
                    )}
                    <DetailRow
                      label="Frequency"
                      value={
                        investment.dividend_frequency
                          ? DIVIDEND_FREQUENCY_LABELS[
                              investment.dividend_frequency
                            ]
                          : '—'
                      }
                    />
                    <DetailRow
                      label="Start date"
                      value={formatDate(investment.start_date)}
                    />
                    <DetailRow
                      label="Maturity date"
                      value={formatDate(investment.maturity_date)}
                    />
                    <DetailRow
                      label="Duration"
                      value={`${investment.investment_duration_in_month} months`}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="space-y-4 p-5">
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-foreground">
                        Description
                      </h3>
                      <p className="whitespace-pre-line text-sm text-muted-foreground">
                        {investment.description}
                      </p>
                    </div>
                    {investment.key_highlights &&
                      Object.keys(investment.key_highlights).length > 0 && (
                        <div>
                          <h3 className="mb-2 text-sm font-semibold text-foreground">
                            Highlights
                          </h3>
                          <div className="space-y-1">
                            {Object.entries(investment.key_highlights).map(
                              ([label, value]) => (
                                <DetailRow
                                  key={label}
                                  label={label}
                                  value={String(value)}
                                />
                              ),
                            )}
                          </div>
                        </div>
                      )}
                  </CardContent>
                </Card>
              </div>

              {investment.faqs.length > 0 && (
                <Card>
                  <CardContent className="space-y-4 p-5">
                    <h3 className="text-sm font-semibold text-foreground">
                      FAQs
                    </h3>
                    {investment.faqs.map((faq) => (
                      <div key={faq.id}>
                        <p className="text-sm font-medium text-foreground">
                          {faq.question}
                        </p>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {investment.terms_conditions && (
                <Card>
                  <CardContent className="p-5">
                    <h3 className="mb-2 text-sm font-semibold text-foreground">
                      Terms &amp; conditions
                    </h3>
                    <p className="whitespace-pre-line text-sm text-muted-foreground">
                      {investment.terms_conditions}
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="media" className="space-y-6 pt-4">
              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  Images
                </h3>
                {investment.images.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No images.</p>
                ) : (
                  <PhotoProvider>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                      {investment.images.map((img) => (
                        <div
                          key={img.id}
                          className="relative aspect-video overflow-hidden rounded-md border border-border bg-muted"
                        >
                          {img.document?.temporary_signed_url ? (
                            <PhotoView src={img.document.temporary_signed_url}>
                              <img
                                src={img.document.temporary_signed_url}
                                alt=""
                                className="h-full w-full cursor-zoom-in object-cover"
                              />
                            </PhotoView>
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-muted-foreground" />
                            </div>
                          )}
                          {img.is_primary && (
                            <span className="absolute left-1.5 top-1.5 rounded bg-primary px-1.5 py-0.5 text-[10px] font-medium text-white">
                              Cover
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </PhotoProvider>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground">
                  Documents
                </h3>
                {investment.documents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No documents.</p>
                ) : (
                  <div className="space-y-2">
                    {investment.documents.map((doc) => (
                      <div
                        key={doc.id}
                        className="flex items-center gap-3 rounded-md border border-border bg-card p-3"
                      >
                        <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
                        <span className="flex-1 truncate text-sm text-foreground">
                          {doc.caption ?? doc.document?.name ?? 'Document'}
                        </span>
                        {doc.document?.temporary_signed_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a
                              href={doc.document.temporary_signed_url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              <Download className="mr-1 h-3.5 w-3.5" />
                              View
                            </a>
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="dividends" className="pt-4">
              {investment.dividend_schedules.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No dividend schedule.
                </p>
              ) : (
                <div className="space-y-2">
                  {investment.dividend_schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className="flex flex-col gap-3 rounded-md border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {DIVIDEND_TYPE_LABELS[schedule.type]}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(schedule.payment_date)} ·{' '}
                          {formatPercent(schedule.percentage_of_capital)} of
                          capital
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        {schedule.is_processed ? (
                          <Badge variant="default">Processed</Badge>
                        ) : (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="gap-1"
                              disabled={isUpdatingScheduleDates}
                              onClick={() => openScheduleDateEdit(schedule)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                              Edit
                            </Button>
                            <Badge variant="outline">Pending</Badge>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="investors" className="pt-4">
              <InvestorTable investmentId={investment.id} />
            </TabsContent>
          </Tabs>
        </>
      )}

      <Sheet
        open={Boolean(activeSchedule)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeScheduleDateEdit()
        }}
      >
        <SheetContent
          side="right"
          className="flex w-full flex-col p-0 sm:max-w-xl"
        >
          <SheetHeader className="border-b border-border">
            <SheetTitle>Edit payout date</SheetTitle>
            <SheetDescription>
              Review the schedule impact before moving this payout.
            </SheetDescription>
          </SheetHeader>

          {activeSchedule && activeScheduleBounds && (
            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              <div className="rounded-md border border-border bg-card">
                <div className="border-b border-border px-4 py-3">
                  <p className="text-sm font-medium text-foreground">
                    {DIVIDEND_TYPE_LABELS[activeSchedule.type]}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatPercent(activeSchedule.percentage_of_capital)} of
                    capital
                  </p>
                </div>
                <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                  <div className="px-4 py-3">
                    <p className="text-xs text-muted-foreground">
                      Current date
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {formatDate(activeSchedule.payment_date)}
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs text-muted-foreground">
                      New schedule date
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {scheduleEditDate
                        ? formatDate(new Date(scheduleEditDate).toISOString())
                        : 'Not selected'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-md border border-border bg-card">
                <div className="border-b border-border px-4 py-3">
                  <p className="text-sm font-medium text-foreground">
                    Edit boundary
                  </p>
                  <p className="text-xs text-muted-foreground">
                    The payout can move inside the neighboring schedule dates.
                  </p>
                </div>
                <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                  <div className="px-4 py-3">
                    <p className="text-xs text-muted-foreground">
                      Earliest date
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {formatDate(activeScheduleBounds.minDate.toISOString())}
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs text-muted-foreground">Latest date</p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {formatDate(activeScheduleBounds.maxDate.toISOString())}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-md bg-muted/60 px-4 py-3 text-xs text-muted-foreground">
                Only the payout date changes. The payout type, processed status,
                and percentage stay unchanged.
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">
                  New payout date
                </p>
                <DatePicker
                  placeHolderText="Pick a date"
                  showPlaceholder
                  showYear
                  className="mb-0"
                  selectedDate={scheduleEditDate || undefined}
                  minDate={activeScheduleBounds.minDate}
                  maxDate={activeScheduleBounds.maxDate}
                  onDateSelect={(date) => {
                    setScheduleEditDate(toDateInput(date))
                    setScheduleEditError('')
                  }}
                />
                {scheduleEditError && (
                  <p className="text-xs text-destructive">
                    {scheduleEditError}
                  </p>
                )}
              </div>
            </div>
          )}

          <SheetFooter className="flex-row justify-end gap-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={closeScheduleDateEdit}
              disabled={isUpdatingScheduleDates}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={saveScheduleDateEdit}
              disabled={
                isUpdatingScheduleDates ||
                !activeSchedule ||
                !scheduleEditDate ||
                scheduleEditDate === toDateInput(activeSchedule.payment_date)
              }
            >
              {isUpdatingScheduleDates ? 'Saving…' : 'Save date'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
