import type { CampaignSchedule } from '@/types/CampaignTypes';
import { CAMPAIGN_SCHEDULE_LABELS } from '@/types/CampaignTypes';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import DatePicker from '@/components/shared/DatePicker';

const SCHEDULE_KINDS: Array<CampaignSchedule> = [
  'immediate',
  'one_off',
  'recurring',
];

type Frequency = 'daily' | 'weekly' | 'monthly';

const DAYS_OF_WEEK = [
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
  { value: '0', label: 'Sunday' },
];

const ORDINAL_SUFFIX = ['st', 'nd', 'rd'];
function ordinal(n: number): string {
  const v = n % 100;
  if (v >= 11 && v <= 13) return `${n}th`;
  return `${n}${ORDINAL_SUFFIX[(v % 10) - 1] ?? 'th'}`;
}

const DEFAULT_CRON = '0 9 * * 1'; // weekly, Monday 09:00

export type ScheduleValue = {
  schedule_kind: CampaignSchedule;
  scheduled_at: string;
  cron_expression: string;
};

type ScheduleFieldsProps = {
  value: ScheduleValue;
  onChange: (next: ScheduleValue) => void;
};

// ---- cron <-> friendly-fields helpers (pure) ------------------------------

type ParsedCron = {
  frequency: Frequency;
  time: string;
  dayOfWeek: string;
  dayOfMonth: string;
};

function parseCron(cron: string): ParsedCron {
  const fallback: ParsedCron = {
    frequency: 'weekly',
    time: '09:00',
    dayOfWeek: '1',
    dayOfMonth: '1',
  };
  const parts = cron.trim().split(/\s+/);
  if (parts.length !== 5) return fallback;
  const [m, h, dom, , dow] = parts;
  if (m === '*' || h === '*') return fallback;
  const time = `${h.padStart(2, '0')}:${m.padStart(2, '0')}`;
  if (dow !== '*' && dom === '*')
    return { frequency: 'weekly', time, dayOfWeek: dow, dayOfMonth: '1' };
  if (dom !== '*' && dow === '*')
    return { frequency: 'monthly', time, dayOfWeek: '1', dayOfMonth: dom };
  return { frequency: 'daily', time, dayOfWeek: '1', dayOfMonth: '1' };
}

function buildCron(p: ParsedCron): string {
  const [hh = '9', mm = '0'] = p.time.split(':');
  const minute = String(Number(mm));
  const hour = String(Number(hh));
  if (p.frequency === 'daily') return `${minute} ${hour} * * *`;
  if (p.frequency === 'weekly') return `${minute} ${hour} * * ${p.dayOfWeek}`;
  return `${minute} ${hour} ${p.dayOfMonth} * *`;
}

// ---- send-at (date + time) helpers ----------------------------------------

function timeFromIso(iso: string): string {
  if (!iso) return '09:00';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '09:00';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function combineDateTime(dateIso: string, time: string): string {
  if (!dateIso) return '';
  const d = new Date(dateIso);
  if (Number.isNaN(d.getTime())) return '';
  const [hh = '9', mm = '0'] = time.split(':');
  d.setHours(Number(hh), Number(mm), 0, 0);
  return d.toISOString();
}

export default function ScheduleFields({ value, onChange }: ScheduleFieldsProps) {
  // Fully derived from cron_expression — no internal state, so editing an
  // existing campaign always reflects its saved schedule.
  const parsed = parseCron(value.cron_expression || DEFAULT_CRON);
  const setCron = (patch: Partial<ParsedCron>) =>
    onChange({ ...value, cron_expression: buildCron({ ...parsed, ...patch }) });

  const sendTime = timeFromIso(value.scheduled_at);

  const summary =
    parsed.frequency === 'daily'
      ? `Every day at ${parsed.time}`
      : parsed.frequency === 'weekly'
        ? `Every ${DAYS_OF_WEEK.find((d) => d.value === parsed.dayOfWeek)?.label} at ${parsed.time}`
        : `On the ${ordinal(Number(parsed.dayOfMonth))} of each month at ${parsed.time}`;

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Delivery</Label>
        <Select
          value={value.schedule_kind}
          onValueChange={(v) =>
            onChange({
              ...value,
              schedule_kind: v as CampaignSchedule,
              // Seed a default schedule so recurring campaigns are valid immediately.
              cron_expression:
                v === 'recurring' && !value.cron_expression
                  ? DEFAULT_CRON
                  : value.cron_expression,
            })
          }>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="How to send" />
          </SelectTrigger>
          <SelectContent>
            {SCHEDULE_KINDS.map((k) => (
              <SelectItem key={k} value={k}>
                {CAMPAIGN_SCHEDULE_LABELS[k]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground">
          {value.schedule_kind === 'immediate'
            ? 'Sent right away when you click “Send now” on the campaign.'
            : value.schedule_kind === 'one_off'
              ? 'Sent once at the date and time you choose, after you activate it.'
              : 'Sent automatically on a repeating schedule once activated.'}
        </p>
      </div>

      {value.schedule_kind === 'one_off' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Date</Label>
            <DatePicker
              placeHolderText="Select date"
              selectedDate={value.scheduled_at || undefined}
              minDate={new Date().toISOString()}
              onDateSelect={(date) =>
                onChange({
                  ...value,
                  scheduled_at: combineDateTime(date, sendTime),
                })
              }
              showYear
              showPlaceholder
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="send-time">Time</Label>
            <Input
              id="send-time"
              type="time"
              value={sendTime}
              onChange={(e) =>
                onChange({
                  ...value,
                  scheduled_at: combineDateTime(
                    value.scheduled_at || new Date().toISOString(),
                    e.target.value,
                  ),
                })
              }
            />
          </div>
        </div>
      )}

      {value.schedule_kind === 'recurring' && (
        <div className="space-y-4 rounded-lg border border-border p-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Repeat</Label>
              <Select
                value={parsed.frequency}
                onValueChange={(v) => setCron({ frequency: v as Frequency })}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Every day</SelectItem>
                  <SelectItem value="weekly">Every week</SelectItem>
                  <SelectItem value="monthly">Every month</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="repeat-time">At time</Label>
              <Input
                id="repeat-time"
                type="time"
                value={parsed.time}
                onChange={(e) => setCron({ time: e.target.value })}
              />
            </div>

            {parsed.frequency === 'weekly' && (
              <div className="space-y-1.5">
                <Label>Day of week</Label>
                <Select
                  value={parsed.dayOfWeek}
                  onValueChange={(v) => setCron({ dayOfWeek: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS_OF_WEEK.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {parsed.frequency === 'monthly' && (
              <div className="space-y-1.5">
                <Label>Day of month</Label>
                <Select
                  value={parsed.dayOfMonth}
                  onValueChange={(v) => setCron({ dayOfMonth: v })}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => String(i + 1)).map(
                      (d) => (
                        <SelectItem key={d} value={d}>
                          {ordinal(Number(d))}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <p className="text-sm text-foreground">
            <span className="text-muted-foreground">Schedule: </span>
            {summary}
          </p>
        </div>
      )}
    </div>
  );
}
