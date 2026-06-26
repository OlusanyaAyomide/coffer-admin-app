import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import type {
  CabalDetail,
  ContributionFrequency,
  EntryCurrency,
} from '@/types/LockerTypes';
import { CONTRIBUTION_FREQUENCY_LABELS } from '@/lib/cabalFormat';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import CategoryImageUploadField from '@/components/locker/CategoryImageUploadField';
import LucideIconPicker from '@/components/locker/LucideIconPicker';
import useSaveAdminCabal from '@/hooks/useSaveAdminCabal';
import useLockerCategories from '@/hooks/useLockerCategories';

const CURRENCIES: Array<EntryCurrency> = ['NGN', 'USDT'];
const FREQUENCIES: Array<ContributionFrequency> = ['daily', 'weekly', 'monthly'];
const FEATURED_PRIORITIES = Array.from({ length: 10 }, (_, index) => index + 1);

type CabalFormSheetProps = {
  /** Provide to edit; omit to create. */
  cabal?: CabalDetail;
  trigger: ReactNode;
  /** Receives the created/updated cabal id on success. */
  onSaved?: (cabalId?: string) => void;
};

/** Convert an ISO date string to the yyyy-mm-dd shape <input type="date"> needs. */
function toDateInput(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

export default function CabalFormSheet({
  cabal,
  trigger,
  onSaved,
}: CabalFormSheetProps) {
  const isEdit = Boolean(cabal);
  const [open, setOpen] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [goalName, setGoalName] = useState('');
  const [currency, setCurrency] = useState<EntryCurrency>('NGN');
  const [contributionAmount, setContributionAmount] = useState('');
  const [frequency, setFrequency] = useState<ContributionFrequency | ''>('');
  const [targetAmount, setTargetAmount] = useState('');
  const [maxMembers, setMaxMembers] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [contributionDay, setContributionDay] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [importance, setImportance] = useState('');
  const [promotionalBonus, setPromotionalBonus] = useState('');

  const { categories } = useLockerCategories({
    limit: 100,
    is_active: true,
    sort_by: 'sort_order',
    order: 'asc',
  });
  useEffect(() => {
    if (!open) return;
    setName(cabal?.name ?? '');
    setDescription(cabal?.description ?? '');
    setGoalName(cabal?.goal_name ?? '');
    setCurrency(cabal?.currency ?? 'NGN');
    setContributionAmount(cabal?.contribution_amount ?? '');
    setFrequency(cabal?.contribution_frequency ?? '');
    setTargetAmount(cabal?.target_amount ?? '');
    setMaxMembers(
      cabal?.max_members != null ? String(cabal.max_members) : '',
    );
    setStartDate(toDateInput(cabal?.start_date));
    setEndDate(toDateInput(cabal?.end_date));
    setCategoryId(cabal?.category_id ?? cabal?.category?.id ?? '');
    setContributionDay('');
    setIconUrl(cabal?.icon_url ?? '');
    setImageUrl(cabal?.image_url ?? '');
    setIsFeatured(cabal?.is_featured ?? false);
    setImportance(
      cabal?.importance != null && cabal.importance >= 1 && cabal.importance <= 10
        ? String(cabal.importance)
        : '',
    );
    setPromotionalBonus(cabal?.promotional_bonus ?? '');
  }, [open, cabal]);

  const { saveCabal, isSavingCabal } = useSaveAdminCabal({
    cabalId: cabal?.id,
    onSuccess: (id) => {
      setOpen(false);
      onSaved?.(id);
    },
  });

  const canSubmit =
    name.trim() !== '' &&
    description.trim() !== '' &&
    goalName.trim() !== '' &&
    contributionAmount.trim() !== '' &&
    frequency !== '' &&
    endDate !== '' &&
    (!isFeatured || importance !== '') &&
    !isSavingCabal;

  const toNumber = (value: string): number | undefined => {
    const trimmed = value.trim();
    if (trimmed === '') return undefined;
    const n = Number(trimmed);
    return Number.isNaN(n) ? undefined : n;
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    saveCabal({
      name: name.trim(),
      description: description.trim(),
      goal_name: goalName.trim(),
      currency,
      contribution_amount: toNumber(contributionAmount),
      contribution_frequency: frequency,
      target_amount: toNumber(targetAmount),
      max_members: toNumber(maxMembers),
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      category_id: categoryId || undefined,
      contribution_day: toNumber(contributionDay),
      icon_url: iconUrl.trim() || undefined,
      image_url: imageUrl.trim() || undefined,
      is_featured: isFeatured,
      importance: isFeatured ? toNumber(importance) : undefined,
      promotional_bonus: toNumber(promotionalBonus),
    });
  };

  const handleFeaturedChange = (checked: boolean) => {
    setIsFeatured(checked);
    if (checked && !importance) {
      setImportance('10');
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-3xl p-0">
        {/* Cabal brand band */}
        <div className="h-1.5 w-full shrink-0 bg-yellow-500" />
        <SheetHeader className="border-b border-border">
          <SheetTitle>{isEdit ? 'Edit cabal' : 'New cabal'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update this cabal’s configuration. Changes apply to how the cabal is shown and run.'
              : 'Create a public company cabal that users can discover and join.'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Identity */}
          <section className="space-y-5">
            <h3 className="text-sm font-semibold text-foreground">Identity</h3>

            <div className="space-y-2">
              <Label htmlFor="cabal-name">Name</Label>
              <Input
                id="cabal-name"
                placeholder="e.g. December Detty Cabal"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cabal-goal">Goal name</Label>
              <Input
                id="cabal-goal"
                placeholder="What the cabal is saving toward"
                value={goalName}
                onChange={(e) => setGoalName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cabal-description">Description</Label>
              <Textarea
                id="cabal-description"
                placeholder="Short description shown to users"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cabal-category">
                Category{' '}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Select
                value={categoryId || 'none'}
                onValueChange={(v) => setCategoryId(v === 'none' ? '' : v)}
              >
                <SelectTrigger id="cabal-category" className="w-full">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No category</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <LucideIconPicker
              value={iconUrl}
              onChange={setIconUrl}
              onClear={() => setIconUrl('')}
              folderSuffix="cabals/icon"
            />

            <CategoryImageUploadField
              value={imageUrl}
              onChange={setImageUrl}
              onClear={() => setImageUrl('')}
              label="Cabal image"
              entityName="cabal image"
              folderSuffix="cabals/image"
            />
          </section>

          <Separator />

          {/* Contribution */}
          <section className="space-y-5">
            <h3 className="text-sm font-semibold text-foreground">
              Contribution
            </h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cabal-currency">Currency</Label>
                <Select
                  value={currency}
                  onValueChange={(v) => setCurrency(v as EntryCurrency)}
                >
                  <SelectTrigger id="cabal-currency" className="w-full">
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="cabal-amount">Contribution amount</Label>
                <Input
                  id="cabal-amount"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  placeholder="0.00"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cabal-frequency">Frequency</Label>
                <Select
                  value={frequency}
                  onValueChange={(v) =>
                    setFrequency(v as ContributionFrequency)
                  }
                >
                  <SelectTrigger id="cabal-frequency" className="w-full">
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    {FREQUENCIES.map((f) => (
                      <SelectItem key={f} value={f}>
                        {CONTRIBUTION_FREQUENCY_LABELS[f]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cabal-day">
                  Contribution day{' '}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="cabal-day"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={31}
                  placeholder="e.g. 1"
                  value={contributionDay}
                  onChange={(e) => setContributionDay(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cabal-target">
                  Target amount{' '}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="cabal-target"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  placeholder="0.00"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cabal-max">
                  Max members{' '}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="cabal-max"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  placeholder="Unlimited"
                  value={maxMembers}
                  onChange={(e) => setMaxMembers(e.target.value)}
                />
              </div>
            </div>
          </section>

          <Separator />

          {/* Schedule */}
          <section className="space-y-5">
            <h3 className="text-sm font-semibold text-foreground">Schedule</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cabal-start">
                  Start date{' '}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="cabal-start"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cabal-end">End date</Label>
                <Input
                  id="cabal-end"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 3 months out and after the start date.
                </p>
              </div>
            </div>
          </section>

          <Separator />

          {/* Admin config */}
          <section className="space-y-5">
            <h3 className="text-sm font-semibold text-foreground">
              Admin configuration
            </h3>

            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Featured</p>
                <p className="text-xs text-muted-foreground">
                  Featured cabals surface on the discovery rail.
                </p>
              </div>
              <Switch checked={isFeatured} onCheckedChange={handleFeaturedChange} />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="cabal-importance">Featured priority</Label>
                <Select
                  value={importance}
                  onValueChange={setImportance}
                  disabled={!isFeatured}
                >
                  <SelectTrigger id="cabal-importance" className="w-full">
                    <SelectValue placeholder="Choose priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {FEATURED_PRIORITIES.map((priority) => (
                      <SelectItem key={priority} value={String(priority)}>
                        {priority}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Select 1-10 only. 1 is the highest priority and 10 is the
                  lowest.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cabal-bonus">
                  Promotional bonus{' '}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="cabal-bonus"
                  type="number"
                  inputMode="decimal"
                  min={0}
                  placeholder="0.00"
                  value={promotionalBonus}
                  onChange={(e) => setPromotionalBonus(e.target.value)}
                />
              </div>
            </div>
          </section>
        </div>

        <SheetFooter className="flex-row justify-end gap-2 border-t border-border">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSavingCabal}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isSavingCabal
              ? 'Saving…'
              : isEdit
                ? 'Save changes'
                : 'Create cabal'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
