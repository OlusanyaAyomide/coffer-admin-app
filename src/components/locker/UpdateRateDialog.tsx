import { useState } from 'react';
import type { ReactNode } from 'react';

import type { LockerType, SavingsRate } from '@/types/LockerTypes';
import { LOCKER_TYPE_LABELS, LOCKER_TYPE_THEME } from '@/types/LockerTypes';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import useCreateLockerRate from '@/hooks/useCreateLockerRate';

type UpdateRateDialogProps = {
  type: LockerType;
  currentRate: SavingsRate | null;
  trigger: ReactNode;
};

export default function UpdateRateDialog({
  type,
  currentRate,
  trigger,
}: UpdateRateDialogProps) {
  const [open, setOpen] = useState(false);
  const [rate, setRate] = useState('');
  const [note, setNote] = useState('');

  const { createRate, isCreatingRate } = useCreateLockerRate(() => {
    setOpen(false);
    setRate('');
    setNote('');
  });

  const theme = LOCKER_TYPE_THEME[type];

  const parsedRate = parseFloat(rate);
  const isRateValid =
    rate.trim() !== '' && !Number.isNaN(parsedRate) && parsedRate >= 0 && parsedRate <= 100;
  // Note is optional.
  const canSubmit = isRateValid && !isCreatingRate;

  const dailyPreview = isRateValid ? (parsedRate / 365).toFixed(6) : '—';

  const handleSubmit = () => {
    if (!canSubmit) return;
    createRate({ type, rate: parsedRate, note: note.trim() || undefined });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-4xl p-0">
        {/* brand color band */}
        <div className={cn('h-1.5 w-full shrink-0', theme.accent)} />
        <SheetHeader className="border-b border-border">
          <SheetTitle>Update {LOCKER_TYPE_LABELS[type]} rate</SheetTitle>
          <SheetDescription>
            Sets a new annual interest rate, effective immediately. The previous
            rate is kept as history.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          {currentRate && (
            <div className="rounded-lg border border-border bg-muted/40 px-3 py-2.5 text-sm text-muted-foreground">
              Current rate:{' '}
              <span className="font-semibold text-foreground">
                {currentRate.base_rate}% / year
              </span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="rate">Annual rate (%)</Label>
            <Input
              id="rate"
              type="number"
              inputMode="decimal"
              min={0}
              max={100}
              step="0.0001"
              placeholder="e.g. 8"
              value={rate}
              onChange={(e) => setRate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">≈ {dailyPreview}% per day</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">
              Reason / note{' '}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="note"
              placeholder="Why is this rate changing? (kept in the audit history)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <p className="text-xs text-muted-foreground">
            This only affects interest accrued from today onward — already-earned
            interest is not recalculated.
          </p>
        </div>

        <SheetFooter className="flex-row justify-end gap-2 border-t border-border">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isCreatingRate}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isCreatingRate ? 'Saving…' : 'Save new rate'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
