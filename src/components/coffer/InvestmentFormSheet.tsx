import { useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { Check, Pencil, Plus, Trash2 } from 'lucide-react'

import type {
  AdminInvestmentDetail,
  CreateInvestmentBody,
  DividendFrequency,
  InvestmentCurrency,
  ReturnPayoutStrategy,
  UpdateInvestmentBody,
} from '@/types/InvestmentTypes'
import type {
  InvestmentDocument,
  InvestmentImage,
} from '@/components/coffer/InvestmentMediaUpload'
import {
  InvestmentDocumentList,
  InvestmentImageGrid,
} from '@/components/coffer/InvestmentMediaUpload'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import NumberInput from '@/components/coffer/NumberInput'
import DatePicker from '@/components/shared/DatePicker'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import {
  DIVIDEND_FREQUENCY_LABELS,
  RETURN_PAYOUT_STRATEGY_LABELS,
  formatDate,
} from '@/lib/cofferFormat'
import {
  useInvestmentCategories,
  useInvestmentSubCategories,
} from '@/hooks/useInvestmentCategories'
import useSaveAdminInvestment from '@/hooks/useSaveAdminInvestment'

const CURRENCIES: Array<InvestmentCurrency> = ['NGN', 'USDT']
const FREQUENCIES: Array<DividendFrequency> = [
  'monthly',
  'quarterly',
  'semi_annually',
  'annually',
]
const RETURN_PAYOUT_STRATEGIES: Array<ReturnPayoutStrategy> = [
  'at_maturity',
  'upfront',
  'recurring',
  'upfront_and_recurring',
]

const STEPS = ['Basics', 'Pricing', 'Returns', 'Media', 'FAQs'] as const

type HighlightRow = { label: string; value: string }
type TimelineRow = {
  scheduleKey: string
  label: string
  date: Date
  generatedDate: Date
  minDate: Date
  maxDate: Date
  percentage: string
  tone: 'return' | 'capital'
  editable: boolean
}

type Props = {
  /** Provide to edit; omit to create. */
  investment?: AdminInvestmentDetail
  trigger: ReactNode
  onSaved?: (investmentId?: string) => void
}

function toDateInput(value: string | null | undefined): string {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString().slice(0, 10)
}

function toNumber(value: string): number | undefined {
  const trimmed = value.trim()
  if (trimmed === '') return undefined
  const n = Number(trimmed)
  return Number.isNaN(n) ? undefined : n
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

function getFrequencyIntervalMonths(frequency: DividendFrequency): number {
  switch (frequency) {
    case 'monthly':
      return 1
    case 'quarterly':
      return 3
    case 'semi_annually':
      return 6
    case 'annually':
      return 12
    case 'ending':
    default:
      return 3
  }
}

function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '0%'
  return `${Number(value.toFixed(2))}%`
}

function scheduleKey(type: string, index: number): string {
  return `${type}-${index}`
}

function startOfDay(date: Date): Date {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

function uniqueBy<T>(items: Array<T>, getKey: (item: T) => string): Array<T> {
  const seen = new Set<string>()
  return items.filter((item) => {
    const key = getKey(item)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function findPreviousDistinctDate(dates: Array<Date>, index: number): Date {
  const current = startOfDay(dates[index]).getTime()
  for (let i = index - 1; i >= 0; i -= 1) {
    const candidate = startOfDay(dates[i])
    if (candidate.getTime() !== current) return candidate
  }
  return startOfDay(dates[index])
}

function findNextDistinctDate(dates: Array<Date>, index: number): Date {
  const current = startOfDay(dates[index]).getTime()
  for (let i = index + 1; i < dates.length; i += 1) {
    const candidate = startOfDay(dates[i])
    if (candidate.getTime() !== current) return candidate
  }
  return startOfDay(dates[index])
}

function applyTimelineOverrides(
  rows: Array<
    Pick<TimelineRow, 'scheduleKey' | 'label' | 'percentage' | 'tone'> & {
      generatedDate: Date
    }
  >,
  overrides: Record<string, string>,
): Array<TimelineRow> {
  const generatedDates = rows.map((row) => row.generatedDate)

  return rows.map((row, index) => {
    const override = overrides[row.scheduleKey]
    const overrideDate = override ? new Date(override) : null
    const date =
      overrideDate && !Number.isNaN(overrideDate.getTime())
        ? overrideDate
        : row.generatedDate

    return {
      ...row,
      date,
      generatedDate: row.generatedDate,
      minDate: findPreviousDistinctDate(generatedDates, index),
      maxDate: findNextDistinctDate(generatedDates, index),
      editable: row.tone === 'return',
    }
  })
}

function highlightsToRows(
  highlights: Record<string, unknown> | null | undefined,
): Array<HighlightRow> {
  if (!highlights || typeof highlights !== 'object') return []
  return Object.entries(highlights).map(([label, value]) => ({
    label,
    value: String(value),
  }))
}

export default function InvestmentFormSheet({
  investment,
  trigger,
  onSaved,
}: Props) {
  const isEdit = Boolean(investment)
  const isActiveEdit = investment?.status === 'active'
  // Once a plan's start date has passed it is fixed — lock only the start-date
  // field so the admin can still edit everything else. The backend ignores an
  // incoming start_date in this case too.
  const startLocked =
    isEdit && investment ? new Date(investment.start_date) <= new Date() : false
  const sensitiveFieldsLocked = isActiveEdit
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  // Basics
  const [title, setTitle] = useState('')
  const [subDescription, setSubDescription] = useState('')
  const [description, setDescription] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [subCategoryId, setSubCategoryId] = useState('')
  const [currency, setCurrency] = useState<InvestmentCurrency>('NGN')
  const [isFeatured, setIsFeatured] = useState(false)
  const [sortOrder, setSortOrder] = useState('0')

  // Pricing & units
  const [pricePerUnit, setPricePerUnit] = useState('')
  const [totalUnits, setTotalUnits] = useState('')
  const [minimumUnits, setMinimumUnits] = useState('1')
  const [maximumUnits, setMaximumUnits] = useState('')

  // Returns & schedule
  const [roiPercentage, setRoiPercentage] = useState('')
  const [returnPayoutStrategy, setReturnPayoutStrategy] =
    useState<ReturnPayoutStrategy>('at_maturity')
  const [dividendFrequency, setDividendFrequency] =
    useState<DividendFrequency>('monthly')
  const [upfrontReturnPercentage, setUpfrontReturnPercentage] = useState('')
  const [startDate, setStartDate] = useState('')
  const [durationMonths, setDurationMonths] = useState('')
  const [scheduleDateOverrides, setScheduleDateOverrides] = useState<
    Record<string, string>
  >({})
  const [scheduleEditKey, setScheduleEditKey] = useState<string | null>(null)
  const [scheduleEditDate, setScheduleEditDate] = useState('')
  const [scheduleEditError, setScheduleEditError] = useState('')

  // Media
  const [images, setImages] = useState<Array<InvestmentImage>>([])
  const [documents, setDocuments] = useState<Array<InvestmentDocument>>([])

  // FAQs & terms
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>(
    [],
  )
  const [highlights, setHighlights] = useState<Array<HighlightRow>>([])
  const [terms, setTerms] = useState('')

  const { categories } = useInvestmentCategories({ is_active: true })
  const { subCategories } = useInvestmentSubCategories({
    categoryId: categoryId || undefined,
    is_active: true,
  })

  useEffect(() => {
    if (!open) return
    setStep(0)
    setTitle(investment?.title ?? '')
    setSubDescription(investment?.sub_description ?? '')
    setDescription(investment?.description ?? '')
    setCategoryId(investment?.category_id ?? '')
    setSubCategoryId(investment?.sub_category_id ?? '')
    setCurrency(investment?.currency ?? 'NGN')
    setIsFeatured(investment?.is_featured ?? false)
    setSortOrder(
      investment?.sort_order != null ? String(investment.sort_order) : '0',
    )
    setPricePerUnit(investment?.price_per_unit ?? '')
    setTotalUnits(
      investment?.total_units != null ? String(investment.total_units) : '',
    )
    setMinimumUnits(
      investment?.minimum_units_purchasable != null
        ? String(investment.minimum_units_purchasable)
        : '1',
    )
    setMaximumUnits(
      investment?.maximum_units_purchasable != null
        ? String(investment.maximum_units_purchasable)
        : '',
    )
    setRoiPercentage(investment?.roi_percentage ?? '')
    setReturnPayoutStrategy(
      investment?.return_payout_strategy ??
        (investment?.dividend_frequency &&
        investment.dividend_frequency !== 'ending'
          ? 'recurring'
          : 'at_maturity'),
    )
    setDividendFrequency(
      investment?.dividend_frequency &&
        investment.dividend_frequency !== 'ending'
        ? investment.dividend_frequency
        : 'monthly',
    )
    setUpfrontReturnPercentage(investment?.upfront_return_percentage ?? '')
    setScheduleDateOverrides({})
    setScheduleEditKey(null)
    setScheduleEditDate('')
    setScheduleEditError('')
    setStartDate(toDateInput(investment?.start_date))
    setDurationMonths(
      investment?.investment_duration_in_month != null
        ? String(investment.investment_duration_in_month)
        : '',
    )
    setImages(
      uniqueBy(
        investment?.images.map((img) => ({
          document_id: img.document_id,
          url: img.document?.temporary_signed_url ?? null,
        })) ?? [],
        (img) => img.document_id,
      ),
    )
    setDocuments(
      uniqueBy(
        investment?.documents.map((doc) => ({
          upload_id: doc.document_id,
          name: doc.caption ?? doc.document?.name ?? 'Document',
          url: doc.document?.temporary_signed_url ?? null,
        })) ?? [],
        (doc) => doc.upload_id,
      ),
    )
    setFaqs(
      investment?.faqs.map((faq) => ({
        question: faq.question,
        answer: faq.answer,
      })) ?? [],
    )
    setHighlights(highlightsToRows(investment?.key_highlights))
    setTerms(investment?.terms_conditions ?? '')
  }, [open, investment])

  const { saveInvestment, isSavingInvestment } = useSaveAdminInvestment({
    investmentId: investment?.id,
    onSuccess: (id) => {
      setOpen(false)
      onSaved?.(id)
    },
  })

  useEffect(() => {
    setScheduleDateOverrides({})
  }, [
    dividendFrequency,
    durationMonths,
    returnPayoutStrategy,
    roiPercentage,
    startDate,
    upfrontReturnPercentage,
  ])

  const roiValue = toNumber(roiPercentage) ?? 0
  const durationValue = toNumber(durationMonths) ?? 0
  const upfrontValue = toNumber(upfrontReturnPercentage)
  const usesFrequency =
    returnPayoutStrategy === 'recurring' ||
    returnPayoutStrategy === 'upfront_and_recurring'
  const usesUpfrontInput = returnPayoutStrategy === 'upfront_and_recurring'
  const upfrontValid =
    !usesUpfrontInput ||
    (upfrontValue !== undefined && upfrontValue > 0 && upfrontValue < roiValue)

  const timelineRows = useMemo<Array<TimelineRow>>(() => {
    if (!startDate || durationValue < 1) return []

    const start = new Date(startDate)
    if (Number.isNaN(start.getTime())) return []

    const maturity = addMonths(start, durationValue)
    const rows: Array<
      Pick<TimelineRow, 'scheduleKey' | 'label' | 'percentage' | 'tone'> & {
        generatedDate: Date
      }
    > = []

    const addReturn = ({
      key,
      label,
      date,
      percentage,
    }: {
      key: string
      label: string
      date: Date
      percentage: number
    }) => {
      rows.push({
        scheduleKey: key,
        label,
        generatedDate: date,
        percentage: `${formatPercent(percentage)} of capital`,
        tone: 'return',
      })
    }

    const addCapital = () => {
      rows.push({
        scheduleKey: scheduleKey('capital_payout', 1),
        label: 'Capital return',
        generatedDate: maturity,
        percentage: '100% of capital',
        tone: 'capital',
      })
    }

    if (returnPayoutStrategy === 'upfront') {
      addReturn({
        key: scheduleKey('final_payout', 1),
        label: 'One-time return payout',
        date: start,
        percentage: roiValue,
      })
      addCapital()
      return applyTimelineOverrides(rows, scheduleDateOverrides)
    }

    if (returnPayoutStrategy === 'recurring') {
      const interval = getFrequencyIntervalMonths(dividendFrequency)
      const paymentCount = Math.max(1, Math.floor(durationValue / interval))
      const percentagePerPayment = roiValue / paymentCount

      for (let i = 1; i < paymentCount; i += 1) {
        addReturn({
          key: scheduleKey('interim_payout', i),
          label: `Recurring return ${i}`,
          date: addMonths(start, i * interval),
          percentage: percentagePerPayment,
        })
      }
      addReturn({
        key: scheduleKey('final_payout', 1),
        label: 'Final return payout',
        date: maturity,
        percentage: percentagePerPayment,
      })
      addCapital()
      return applyTimelineOverrides(rows, scheduleDateOverrides)
    }

    if (returnPayoutStrategy === 'upfront_and_recurring') {
      const upfront = upfrontValue ?? 0
      const interval = getFrequencyIntervalMonths(dividendFrequency)
      const paymentCount = Math.max(1, Math.floor(durationValue / interval))
      const remaining = Math.max(0, roiValue - upfront)
      const percentagePerPayment = remaining / paymentCount

      addReturn({
        key: scheduleKey('interim_payout', 1),
        label: 'Upfront return payout',
        date: start,
        percentage: upfront,
      })
      for (let i = 1; i < paymentCount; i += 1) {
        addReturn({
          key: scheduleKey('interim_payout', i + 1),
          label: `Recurring return ${i}`,
          date: addMonths(start, i * interval),
          percentage: percentagePerPayment,
        })
      }
      addReturn({
        key: scheduleKey('final_payout', 1),
        label: 'Final return payout',
        date: maturity,
        percentage: percentagePerPayment,
      })
      addCapital()
      return applyTimelineOverrides(rows, scheduleDateOverrides)
    }

    addReturn({
      key: scheduleKey('final_payout', 1),
      label: 'Return payout',
      date: maturity,
      percentage: roiValue,
    })
    addCapital()
    return applyTimelineOverrides(rows, scheduleDateOverrides)
  }, [
    dividendFrequency,
    durationValue,
    returnPayoutStrategy,
    roiValue,
    scheduleDateOverrides,
    startDate,
    upfrontValue,
  ])

  const activeScheduleRow =
    timelineRows.find((row) => row.scheduleKey === scheduleEditKey) ?? null

  const isScheduleEditWithinBounds = (
    row: TimelineRow,
    value: string,
  ): boolean => {
    const selected = new Date(value)
    if (Number.isNaN(selected.getTime())) return false

    const selectedTime = startOfDay(selected).getTime()
    return (
      selectedTime >= startOfDay(row.minDate).getTime() &&
      selectedTime <= startOfDay(row.maxDate).getTime()
    )
  }

  const stepValid = useMemo(() => {
    return [
      title.trim() !== '' &&
        description.trim() !== '' &&
        categoryId !== '' &&
        Boolean(currency),
      (toNumber(pricePerUnit) ?? 0) > 0 &&
        (toNumber(totalUnits) ?? 0) >= 1 &&
        (toNumber(minimumUnits) ?? 0) >= 1,
      (toNumber(roiPercentage) ?? -1) >= 0 &&
        startDate !== '' &&
        (toNumber(durationMonths) ?? 0) >= 1 &&
        upfrontValid,
      images.length >= 1,
      true,
    ]
  }, [
    title,
    description,
    categoryId,
    currency,
    pricePerUnit,
    totalUnits,
    minimumUnits,
    roiPercentage,
    startDate,
    durationMonths,
    upfrontValid,
    images,
  ])

  const canSubmit = stepValid.every(Boolean) && !isSavingInvestment

  const buildHighlights = (): Record<string, unknown> | undefined => {
    const valid = highlights.filter(
      (h) => h.label.trim() !== '' && h.value.trim() !== '',
    )
    if (!valid.length) return undefined
    return Object.fromEntries(
      valid.map((h) => [h.label.trim(), h.value.trim()]),
    )
  }

  const buildScheduleDateOverrides = () => {
    const overrides = timelineRows
      .filter(
        (row) =>
          row.editable &&
          toDateInput(row.date.toISOString()) !==
            toDateInput(row.generatedDate.toISOString()),
      )
      .map((row) => ({
        schedule_key: row.scheduleKey,
        payment_date: toDateInput(row.date.toISOString()),
      }))

    return overrides.length ? overrides : undefined
  }

  const openScheduleEdit = (row: TimelineRow) => {
    setScheduleEditKey(row.scheduleKey)
    setScheduleEditDate(toDateInput(row.date.toISOString()))
    setScheduleEditError('')
  }

  const closeScheduleEdit = () => {
    setScheduleEditKey(null)
    setScheduleEditDate('')
    setScheduleEditError('')
  }

  const applyScheduleEdit = () => {
    if (!activeScheduleRow) return
    if (!scheduleEditDate) {
      setScheduleEditError('Choose a new payout date.')
      return
    }

    if (!isScheduleEditWithinBounds(activeScheduleRow, scheduleEditDate)) {
      setScheduleEditError(
        `Choose a date between ${formatDate(
          activeScheduleRow.minDate.toISOString(),
        )} and ${formatDate(activeScheduleRow.maxDate.toISOString())}.`,
      )
      return
    }

    const generatedDate = toDateInput(
      activeScheduleRow.generatedDate.toISOString(),
    )
    setScheduleDateOverrides((current) => {
      const next = { ...current }
      if (scheduleEditDate === generatedDate) {
        delete next[activeScheduleRow.scheduleKey]
      } else {
        next[activeScheduleRow.scheduleKey] = scheduleEditDate
      }
      return next
    })
    closeScheduleEdit()
  }

  const handleSubmit = () => {
    if (!canSubmit) return

    if (isEdit && investment) {
      const origImageIds = investment.images.map((i) => i.document_id)
      const curImageIds = images.map((i) => i.document_id)
      const origDocIds = investment.documents.map((d) => d.document_id)
      const imageIdsToAdd = curImageIds.filter(
        (id) => !origImageIds.includes(id),
      )
      const imageIdsToRemove = origImageIds.filter(
        (id) => !curImageIds.includes(id),
      )
      const documentIdsToAdd = documents
        .filter((d) => !origDocIds.includes(d.upload_id))
        .map((d) => ({
          upload_id: d.upload_id,
          name: d.name.trim() || 'Document',
        }))
      const documentIdsToRemove = origDocIds.filter(
        (id) => !documents.some((d) => d.upload_id === id),
      )
      const faqPayload = faqs
        .filter((f) => f.question.trim() !== '' && f.answer.trim() !== '')
        .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() }))

      if (isActiveEdit) {
        const body: UpdateInvestmentBody = {
          title: title.trim(),
          description: description.trim(),
          sub_description: subDescription.trim() || undefined,
          key_highlights: buildHighlights(),
          terms_conditions: terms.trim() || undefined,
          is_featured: isFeatured,
          sort_order: toNumber(sortOrder) ?? 0,
          image_ids_to_add: imageIdsToAdd,
          image_ids_to_remove: imageIdsToRemove,
          image_ids_order: curImageIds,
          document_ids_to_add: documentIdsToAdd,
          document_ids_to_remove: documentIdsToRemove,
          faqs: faqPayload,
        }
        saveInvestment(body)
        return
      }

      const body: UpdateInvestmentBody = {
        title: title.trim(),
        description: description.trim(),
        sub_description: subDescription.trim() || undefined,
        category_id: categoryId,
        sub_category_id: subCategoryId || undefined,
        price_per_unit: toNumber(pricePerUnit),
        minimum_units_purchasable: toNumber(minimumUnits),
        maximum_units_purchasable: toNumber(maximumUnits),
        total_units: toNumber(totalUnits),
        roi_percentage: toNumber(roiPercentage),
        // A passed start date is fixed — don't resend it (backend ignores it too).
        start_date: startLocked ? undefined : startDate || undefined,
        investment_duration_in_month: toNumber(durationMonths),
        return_payout_strategy: returnPayoutStrategy,
        dividend_frequency: usesFrequency ? dividendFrequency : undefined,
        upfront_return_percentage: usesUpfrontInput
          ? toNumber(upfrontReturnPercentage)
          : undefined,
        schedule_date_overrides: buildScheduleDateOverrides(),
        key_highlights: buildHighlights(),
        terms_conditions: terms.trim() || undefined,
        is_featured: isFeatured,
        sort_order: toNumber(sortOrder) ?? 0,
        image_ids_to_add: imageIdsToAdd,
        image_ids_to_remove: imageIdsToRemove,
        image_ids_order: curImageIds,
        document_ids_to_add: documentIdsToAdd,
        document_ids_to_remove: documentIdsToRemove,
        faqs: faqPayload,
      }
      saveInvestment(body)
      return
    }

    const body: CreateInvestmentBody = {
      title: title.trim(),
      description: description.trim(),
      sub_description: subDescription.trim() || undefined,
      category_id: categoryId,
      sub_category_id: subCategoryId || undefined,
      price_per_unit: toNumber(pricePerUnit) ?? 0,
      minimum_units_purchasable: toNumber(minimumUnits),
      maximum_units_purchasable: toNumber(maximumUnits),
      currency,
      total_units: toNumber(totalUnits) ?? 0,
      roi_percentage: toNumber(roiPercentage) ?? 0,
      return_payout_strategy: returnPayoutStrategy,
      dividend_frequency: usesFrequency ? dividendFrequency : undefined,
      upfront_return_percentage: usesUpfrontInput
        ? toNumber(upfrontReturnPercentage)
        : undefined,
      schedule_date_overrides: buildScheduleDateOverrides(),
      start_date: startDate,
      investment_duration_in_month: toNumber(durationMonths) ?? 0,
      image_ids: images.map((i) => i.document_id),
      document_ids: documents.map((d) => ({
        upload_id: d.upload_id,
        name: d.name.trim() || 'Document',
      })),
      key_highlights: buildHighlights(),
      terms_conditions: terms.trim() || undefined,
      is_featured: isFeatured,
      sort_order: toNumber(sortOrder) ?? 0,
      faqs: faqs
        .filter((f) => f.question.trim() !== '' && f.answer.trim() !== '')
        .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() })),
    }
    saveInvestment(body)
  }

  const isLastStep = step === STEPS.length - 1

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent
          side="right"
          className="flex w-full flex-col p-0 sm:max-w-[96rem]"
        >
          <div className="h-1.5 w-full shrink-0 bg-primary" />
          <SheetHeader className="border-b border-border">
            <SheetTitle>
              {isEdit ? 'Edit investment' : 'New investment'}
            </SheetTitle>
            <SheetDescription>
              {isEdit
                ? 'Update this investment. Dividend schedules recalculate when dates or frequency change.'
                : 'Create an investment asset that users can browse and buy units in.'}
            </SheetDescription>
          </SheetHeader>

          {/* Step indicator */}
          <div className="flex items-center gap-1 border-b border-border px-6 py-3">
            {STEPS.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setStep(index)}
                className="flex items-center gap-1.5"
              >
                <span
                  className={cn(
                    'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                    index === step
                      ? 'bg-primary text-white'
                      : stepValid[index]
                        ? 'bg-primary/15 text-primary'
                        : 'bg-muted text-muted-foreground',
                  )}
                >
                  {stepValid[index] && index !== step ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    index + 1
                  )}
                </span>
                <span
                  className={cn(
                    'hidden text-xs sm:inline',
                    index === step
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground',
                  )}
                >
                  {label}
                </span>
                {index < STEPS.length - 1 && (
                  <span className="mx-1 hidden h-px w-4 bg-border sm:inline-block" />
                )}
              </button>
            ))}
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
            {step === 0 && (
              <section className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="inv-title">Title</Label>
                  <Input
                    id="inv-title"
                    placeholder="e.g. Green Project"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inv-sub">
                    Short subtitle{' '}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="inv-sub"
                    placeholder="One-line summary"
                    value={subDescription}
                    onChange={(e) => setSubDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inv-desc">Description</Label>
                  <Textarea
                    id="inv-desc"
                    rows={5}
                    placeholder="Full description shown on the asset detail screen"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={categoryId}
                      disabled={sensitiveFieldsLocked}
                      onValueChange={(v) => {
                        setCategoryId(v)
                        setSubCategoryId('')
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {sensitiveFieldsLocked && (
                      <p className="text-xs text-muted-foreground">
                        Locked after investment starts.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>
                      Sub-category{' '}
                      <span className="font-normal text-muted-foreground">
                        (optional)
                      </span>
                    </Label>
                    <Select
                      value={subCategoryId || 'none'}
                      onValueChange={(v) =>
                        setSubCategoryId(v === 'none' ? '' : v)
                      }
                      disabled={!categoryId || sensitiveFieldsLocked}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select sub-category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {subCategories.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {sensitiveFieldsLocked && (
                      <p className="text-xs text-muted-foreground">
                        Locked after investment starts.
                      </p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Select
                    value={currency}
                    onValueChange={(v) => setCurrency(v as InvestmentCurrency)}
                    disabled={isEdit}
                  >
                    <SelectTrigger className="w-full sm:w-1/2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CURRENCIES.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isEdit && (
                    <p className="text-xs text-muted-foreground">
                      Currency can’t be changed after creation.
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <Label htmlFor="inv-featured">Featured</Label>
                      <p className="text-xs text-muted-foreground">
                        Surface first in the app’s Trending row.
                      </p>
                    </div>
                    <Switch
                      id="inv-featured"
                      checked={isFeatured}
                      onCheckedChange={setIsFeatured}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inv-sort-order">Sort order</Label>
                    <Input
                      id="inv-sort-order"
                      type="number"
                      min={0}
                      placeholder="0"
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      Lower shows first in the marketplace list.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {step === 1 && (
              <section className="space-y-4">
                {sensitiveFieldsLocked && (
                  <p className="rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                    Pricing and unit limits are locked after investment starts.
                  </p>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="inv-price">Price per unit</Label>
                    <NumberInput
                      id="inv-price"
                      allowDecimal
                      placeholder="0.00"
                      value={pricePerUnit}
                      onChange={setPricePerUnit}
                      disabled={sensitiveFieldsLocked}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inv-total">Total units</Label>
                    <NumberInput
                      id="inv-total"
                      placeholder="e.g. 100"
                      value={totalUnits}
                      onChange={setTotalUnits}
                      disabled={sensitiveFieldsLocked}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inv-min">Minimum units / purchase</Label>
                    <NumberInput
                      id="inv-min"
                      value={minimumUnits}
                      onChange={setMinimumUnits}
                      disabled={sensitiveFieldsLocked}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inv-max">
                      Maximum units / user{' '}
                      <span className="font-normal text-muted-foreground">
                        (optional)
                      </span>
                    </Label>
                    <NumberInput
                      id="inv-max"
                      placeholder="No limit"
                      value={maximumUnits}
                      onChange={setMaximumUnits}
                      disabled={sensitiveFieldsLocked}
                    />
                  </div>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="space-y-4">
                {sensitiveFieldsLocked && (
                  <p className="rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                    Return, date, duration, and payout schedule fields are
                    locked after investment starts.
                  </p>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="inv-roi">
                      Total return over duration (%)
                    </Label>
                    <NumberInput
                      id="inv-roi"
                      allowDecimal
                      placeholder="e.g. 15"
                      value={roiPercentage}
                      onChange={setRoiPercentage}
                      disabled={sensitiveFieldsLocked}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Return payout pattern</Label>
                    <Select
                      value={returnPayoutStrategy}
                      disabled={sensitiveFieldsLocked}
                      onValueChange={(v) => {
                        const strategy = v as ReturnPayoutStrategy
                        setReturnPayoutStrategy(strategy)
                        if (
                          (strategy === 'recurring' ||
                            strategy === 'upfront_and_recurring') &&
                          dividendFrequency === 'ending'
                        ) {
                          setDividendFrequency('monthly')
                        }
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {RETURN_PAYOUT_STRATEGIES.map((strategy) => (
                          <SelectItem key={strategy} value={strategy}>
                            {RETURN_PAYOUT_STRATEGY_LABELS[strategy]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {usesFrequency && (
                    <div className="space-y-2">
                      <Label>Frequency</Label>
                      <Select
                        value={dividendFrequency}
                        disabled={sensitiveFieldsLocked}
                        onValueChange={(v) =>
                          setDividendFrequency(v as DividendFrequency)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {FREQUENCIES.map((f) => (
                            <SelectItem key={f} value={f}>
                              {DIVIDEND_FREQUENCY_LABELS[f]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  {usesUpfrontInput && (
                    <div className="space-y-2">
                      <Label htmlFor="inv-upfront-return">
                        Upfront return (% of capital)
                      </Label>
                      <NumberInput
                        id="inv-upfront-return"
                        allowDecimal
                        placeholder="e.g. 5"
                        value={upfrontReturnPercentage}
                        onChange={setUpfrontReturnPercentage}
                        disabled={sensitiveFieldsLocked}
                      />
                      {!upfrontValid && (
                        <p className="text-xs text-destructive">
                          Must be greater than 0 and less than total return.
                        </p>
                      )}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Start date</Label>
                    <DatePicker
                      placeHolderText="Pick a date"
                      showPlaceholder
                      showYear
                      className="mb-0"
                      disabled={startLocked || sensitiveFieldsLocked}
                      selectedDate={startDate || undefined}
                      onDateSelect={setStartDate}
                    />
                    {(startLocked || sensitiveFieldsLocked) && (
                      <p className="text-xs text-muted-foreground">
                        {sensitiveFieldsLocked
                          ? 'Locked after investment starts.'
                          : 'The start date has passed and can’t be changed.'}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="inv-duration">Duration (months)</Label>
                    <NumberInput
                      id="inv-duration"
                      placeholder="e.g. 24"
                      value={durationMonths}
                      onChange={setDurationMonths}
                      disabled={sensitiveFieldsLocked}
                    />
                  </div>
                </div>
                <div className="rounded-md border border-border bg-card">
                  <div className="border-b border-border px-3 py-2">
                    <p className="text-sm font-medium text-foreground">
                      Payout timeline
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Return percentages are shown as percentage of capital
                      across the selected duration.
                    </p>
                  </div>
                  {timelineRows.length === 0 ? (
                    <p className="px-3 py-4 text-sm text-muted-foreground">
                      Add a start date and duration to preview payouts.
                    </p>
                  ) : (
                    <div className="divide-y divide-border">
                      {timelineRows.map((row, index) => {
                        const isEdited =
                          toDateInput(row.date.toISOString()) !==
                          toDateInput(row.generatedDate.toISOString())

                        return (
                          <div
                            key={`${row.scheduleKey}-${index}`}
                            className="flex items-center justify-between gap-4 px-3 py-3"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-foreground">
                                {row.label}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(row.date.toISOString())}
                                </p>
                                {isEdited && (
                                  <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                                    Edited from{' '}
                                    {formatDate(
                                      row.generatedDate.toISOString(),
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <span
                                className={cn(
                                  'rounded-md px-2 py-1 text-xs font-medium',
                                  row.tone === 'capital'
                                    ? 'bg-muted text-foreground'
                                    : 'bg-primary/10 text-primary',
                                )}
                              >
                                {row.percentage}
                              </span>
                              {row.editable && !sensitiveFieldsLocked && (
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="gap-1"
                                  onClick={() => openScheduleEdit(row)}
                                >
                                  <Pencil className="h-3.5 w-3.5" />
                                  Edit
                                </Button>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
                <p className="rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                  Maturity is start date + duration. Capital remains locked
                  until the capital return date.
                </p>
              </section>
            )}

            {step === 3 && (
              <section className="space-y-6">
                <InvestmentImageGrid images={images} onChange={setImages} />
                <Separator />
                <InvestmentDocumentList
                  documents={documents}
                  onChange={setDocuments}
                />
              </section>
            )}

            {step === 4 && (
              <section className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Key highlights</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setHighlights([...highlights, { label: '', value: '' }])
                      }
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Add
                    </Button>
                  </div>
                  {highlights.map((row, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="Label (e.g. Return Distribution)"
                        value={row.label}
                        onChange={(e) =>
                          setHighlights(
                            highlights.map((h, i) =>
                              i === index ? { ...h, label: e.target.value } : h,
                            ),
                          )
                        }
                      />
                      <Input
                        placeholder="Value"
                        value={row.value}
                        onChange={(e) =>
                          setHighlights(
                            highlights.map((h, i) =>
                              i === index ? { ...h, value: e.target.value } : h,
                            ),
                          )
                        }
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-9 w-9 shrink-0"
                        onClick={() =>
                          setHighlights(
                            highlights.filter((_, i) => i !== index),
                          )
                        }
                        aria-label="Remove highlight"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>FAQs</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFaqs([...faqs, { question: '', answer: '' }])
                      }
                    >
                      <Plus className="mr-1 h-3.5 w-3.5" />
                      Add
                    </Button>
                  </div>
                  {faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="space-y-2 rounded-md border border-border p-3"
                    >
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Question"
                          value={faq.question}
                          onChange={(e) =>
                            setFaqs(
                              faqs.map((f, i) =>
                                i === index
                                  ? { ...f, question: e.target.value }
                                  : f,
                              ),
                            )
                          }
                        />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="h-9 w-9 shrink-0"
                          onClick={() =>
                            setFaqs(faqs.filter((_, i) => i !== index))
                          }
                          aria-label="Remove FAQ"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                      <Textarea
                        placeholder="Answer"
                        rows={2}
                        value={faq.answer}
                        onChange={(e) =>
                          setFaqs(
                            faqs.map((f, i) =>
                              i === index
                                ? { ...f, answer: e.target.value }
                                : f,
                            ),
                          )
                        }
                      />
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="inv-terms">Terms &amp; conditions</Label>
                  <Textarea
                    id="inv-terms"
                    rows={5}
                    placeholder="Shown before users confirm a purchase"
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                  />
                </div>
              </section>
            )}
          </div>

          <SheetFooter className="flex-row items-center justify-between gap-2 border-t border-border">
            <Button
              variant="ghost"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || isSavingInvestment}
            >
              Back
            </Button>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSavingInvestment}
              >
                Cancel
              </Button>
              {isLastStep ? (
                <Button onClick={handleSubmit} disabled={!canSubmit}>
                  {isSavingInvestment
                    ? 'Saving…'
                    : isEdit
                      ? 'Save changes'
                      : 'Create investment'}
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    setStep((s) => Math.min(STEPS.length - 1, s + 1))
                  }
                  disabled={!stepValid[step]}
                >
                  Next
                </Button>
              )}
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      <Sheet
        open={Boolean(activeScheduleRow)}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) closeScheduleEdit()
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

          {activeScheduleRow && (
            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              <div className="rounded-md border border-border bg-card">
                <div className="border-b border-border px-4 py-3">
                  <p className="text-sm font-medium text-foreground">
                    {activeScheduleRow.label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activeScheduleRow.percentage}
                  </p>
                </div>
                <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                  <div className="px-4 py-3">
                    <p className="text-xs text-muted-foreground">
                      Generated date
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {formatDate(
                        activeScheduleRow.generatedDate.toISOString(),
                      )}
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs text-muted-foreground">
                      New timeline date
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
                    The payout can move inside the neighboring autogenerated
                    dates.
                  </p>
                </div>
                <div className="grid grid-cols-1 divide-y divide-border sm:grid-cols-2 sm:divide-x sm:divide-y-0">
                  <div className="px-4 py-3">
                    <p className="text-xs text-muted-foreground">
                      Earliest date
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {formatDate(activeScheduleRow.minDate.toISOString())}
                    </p>
                  </div>
                  <div className="px-4 py-3">
                    <p className="text-xs text-muted-foreground">Latest date</p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {formatDate(activeScheduleRow.maxDate.toISOString())}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-md bg-muted/60 px-4 py-3 text-xs text-muted-foreground">
                Only the payout date changes. The payout type, return
                percentage, capital lock date, and capital return row stay
                unchanged.
              </div>

              <div className="space-y-2">
                <Label>New payout date</Label>
                <DatePicker
                  placeHolderText="Pick a date"
                  showPlaceholder
                  showYear
                  className="mb-0"
                  selectedDate={scheduleEditDate || undefined}
                  minDate={activeScheduleRow.minDate}
                  maxDate={activeScheduleRow.maxDate}
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
            <Button type="button" variant="outline" onClick={closeScheduleEdit}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={applyScheduleEdit}
              disabled={!activeScheduleRow || !scheduleEditDate}
            >
              Apply edit
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  )
}
