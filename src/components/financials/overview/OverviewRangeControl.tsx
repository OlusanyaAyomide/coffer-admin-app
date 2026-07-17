import { useState } from 'react'
import { CalendarDays } from 'lucide-react'
import type { DateRange } from 'react-day-picker'
import type { OverviewRange } from '@/types/FinancialsTypes'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/services/TimeServices'

export type RangeSelection =
  | { range: OverviewRange }
  | { range: 'custom'; from: string; to: string }

type OverviewRangeControlProps = {
  range: OverviewRange | 'custom'
  customLabel: string | null
  onChange: (selection: RangeSelection) => void
}

const PRESETS: Array<{ value: OverviewRange; label: string }> = [
  { value: '24h', label: 'Last 24h' },
  { value: '7d', label: 'Last 7d' },
  { value: '30d', label: 'Last 30d' },
  { value: 'all', label: 'All time' },
]

/** Local day start / end, sent to the backend as ISO. `to` covers the whole selected day. */
function toIsoStart(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}
function toIsoEnd(date: Date): string {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d.toISOString()
}

export default function OverviewRangeControl({
  range,
  customLabel,
  onChange,
}: OverviewRangeControlProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DateRange | undefined>()

  const applyCustom = () => {
    if (!draft?.from) return
    const end = draft.to ?? draft.from
    onChange({
      range: 'custom',
      from: toIsoStart(draft.from),
      to: toIsoEnd(end),
    })
    setOpen(false)
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={range === 'custom' ? '' : range}
        onValueChange={(value) => onChange({ range: value as OverviewRange })}
      >
        <SelectTrigger className="h-10 w-[132px]">
          <CalendarDays className="h-4 w-4" />
          <SelectValue
            placeholder={range === 'custom' ? 'Custom' : undefined}
          />
        </SelectTrigger>
        <SelectContent>
          {PRESETS.map((preset) => (
            <SelectItem key={preset.value} value={preset.value}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant={range === 'custom' ? 'default' : 'outline'}
            size="sm"
            className="h-10"
          >
            <CalendarDays className="h-4 w-4" />
            {range === 'custom' && customLabel ? customLabel : 'Custom'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={draft}
            onSelect={setDraft}
            defaultMonth={draft?.from}
            autoFocus
          />
          <div className="flex items-center justify-between gap-2 border-t border-border p-3">
            <span className="text-xs text-muted-foreground">
              {draft?.from
                ? `${formatDate(draft.from)} → ${draft.to ? formatDate(draft.to) : '…'}`
                : 'Pick a start and end date'}
            </span>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setDraft(undefined)}
              >
                Clear
              </Button>
              <Button size="sm" disabled={!draft?.from} onClick={applyCustom}>
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
