import type { AudienceFilter, LastActive } from '@/types/CampaignTypes';
import {
  ACCOUNT_STATUS_OPTIONS,
  ACCOUNT_TIER_OPTIONS,
  COMPLETION_STATUS_OPTIONS,
  LAST_ACTIVE_OPTIONS,
} from '@/types/CampaignTypes';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import DatePicker from '@/components/shared/DatePicker';
import CountryMultiSelect from '@/components/campaign/CountryMultiSelect';

type AudienceFilterFieldsProps = {
  value: AudienceFilter;
  onChange: (next: AudienceFilter) => void;
};

const ANY_LAST_ACTIVE = 'any';

/** A labelled checkbox group that toggles values in a string array. */
function CheckboxGroup<T extends string>({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: Array<{ label: string; value: T }>;
  selected: Array<T>;
  onToggle: (value: T) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex flex-wrap gap-3">
        {options.map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer items-center gap-2 text-sm">
            <Checkbox
              checked={selected.includes(opt.value)}
              onCheckedChange={() => onToggle(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </div>
  );
}

/**
 * Preset audience filter editor. Mutates a plain `AudienceFilter` object. When
 * "all eligible users" is checked, the other filters are hidden — they are
 * ignored by the backend anyway.
 */
export default function AudienceFilterFields({
  value,
  onChange,
}: AudienceFilterFieldsProps) {
  const toggleArray = <T extends string>(
    key: 'status' | 'account_tier' | 'completion_status',
    item: T,
  ) => {
    const current = (value[key] ?? []) as Array<T>;
    const next = current.includes(item)
      ? current.filter((v) => v !== item)
      : [...current, item];
    onChange({ ...value, [key]: next.length ? next : undefined });
  };

  return (
    <div className="space-y-5 rounded-lg border border-border p-4">
      <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
        <Checkbox
          checked={Boolean(value.all)}
          onCheckedChange={(checked) =>
            onChange({ ...value, all: Boolean(checked) })
          }
        />
        All eligible users
        <span className="font-normal text-muted-foreground">
          (everyone reachable on this channel who hasn’t opted out)
        </span>
      </label>

      {!value.all && (
        <div className="space-y-5 border-t border-border pt-4">
          <CheckboxGroup
            label="Account status"
            options={ACCOUNT_STATUS_OPTIONS}
            selected={value.status ?? []}
            onToggle={(v) => toggleArray('status', v)}
          />
          <CheckboxGroup
            label="KYC tier"
            options={ACCOUNT_TIER_OPTIONS}
            selected={value.account_tier ?? []}
            onToggle={(v) => toggleArray('account_tier', v)}
          />
          <CheckboxGroup
            label="Onboarding stage"
            options={COMPLETION_STATUS_OPTIONS}
            selected={value.completion_status ?? []}
            onToggle={(v) => toggleArray('completion_status', v)}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Countries</Label>
              <CountryMultiSelect
                value={value.country_id ?? []}
                onChange={(next) =>
                  onChange({
                    ...value,
                    country_id: next.length ? next : undefined,
                  })
                }
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Last active</Label>
              <Select
                value={value.last_active ?? ANY_LAST_ACTIVE}
                onValueChange={(v) =>
                  onChange({
                    ...value,
                    last_active:
                      v === ANY_LAST_ACTIVE ? undefined : (v as LastActive),
                  })
                }>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY_LAST_ACTIVE}>Any</SelectItem>
                  {LAST_ACTIVE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={Boolean(value.has_investment)}
                onCheckedChange={(checked) =>
                  onChange({ ...value, has_investment: Boolean(checked) || undefined })
                }
              />
              Has a Coffer investment
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm">
              <Checkbox
                checked={Boolean(value.has_locks)}
                onCheckedChange={(checked) =>
                  onChange({ ...value, has_locks: Boolean(checked) || undefined })
                }
              />
              Has a lock (self / goal)
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Signed up after
              </Label>
              <DatePicker
                placeHolderText="Any date"
                selectedDate={value.signup_after || undefined}
                onDateSelect={(date) =>
                  onChange({ ...value, signup_after: date || undefined })
                }
                showYear
                showPlaceholder
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Signed up before
              </Label>
              <DatePicker
                placeHolderText="Any date"
                selectedDate={value.signup_before || undefined}
                minDate={value.signup_after || undefined}
                onDateSelect={(date) =>
                  onChange({ ...value, signup_before: date || undefined })
                }
                showYear
                showPlaceholder
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
