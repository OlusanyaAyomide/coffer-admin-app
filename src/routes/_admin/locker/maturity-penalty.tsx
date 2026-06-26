import { createFileRoute } from '@tanstack/react-router';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

import type { LockerType } from '@/types/LockerTypes';
import { LOCKER_TYPE_LABELS, LOCKER_TYPE_THEME } from '@/types/LockerTypes';
import { cn } from '@/lib/utils';
import { formatDateToReadableShort } from '@/services/TimeServices';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import useLockerPreLiquidationPolicy from '@/hooks/useLockerPreLiquidationPolicy';
import useSaveLockerPreLiquidationPolicy from '@/hooks/useSaveLockerPreLiquidationPolicy';

export const Route = createFileRoute('/_admin/locker/maturity-penalty')({
  component: MaturityPenaltyPage,
});

const LOCKER_TYPES: Array<LockerType> = ['self_lock', 'goal_lock', 'cabal'];
const DEFAULT_MINIMUM_ACTIVE_MONTHS = '2';
const DEFAULT_GOAL_LOCK_RANGES = [
  { start_percentage: '1', end_percentage: '20', penalty_rate: '10' },
  { start_percentage: '21', end_percentage: '40', penalty_rate: '20' },
  { start_percentage: '41', end_percentage: '60', penalty_rate: '35' },
  { start_percentage: '61', end_percentage: '80', penalty_rate: '50' },
  { start_percentage: '81', end_percentage: '100', penalty_rate: '75' },
];

type DraftRange = {
  localId: string;
  start_percentage: string;
  end_percentage: string;
  penalty_rate: string;
};

function defaultGoalLockRanges(): Array<DraftRange> {
  return DEFAULT_GOAL_LOCK_RANGES.map((range) => ({
    localId: crypto.randomUUID(),
    ...range,
  }));
}

function parseInteger(value: string) {
  if (!/^\d+$/.test(value.trim())) return null;
  return Number(value);
}

function parseRate(value: string) {
  if (value.trim() === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function validateSchedule({
  minimumActiveMonths,
  ranges,
}: {
  minimumActiveMonths: string;
  ranges: Array<DraftRange>;
}) {
  const months = parseInteger(minimumActiveMonths);
  if (months === null || months < 0) {
    return 'Minimum active months must be 0 or greater.';
  }

  if (ranges.length === 0) {
    return 'Add at least one penalty range.';
  }

  const parsedRanges = ranges.map((range) => ({
    start_percentage: parseInteger(range.start_percentage),
    end_percentage: parseInteger(range.end_percentage),
    penalty_rate: parseRate(range.penalty_rate),
  }));

  for (const range of parsedRanges) {
    if (
      range.start_percentage === null ||
      range.end_percentage === null ||
      range.start_percentage < 1 ||
      range.start_percentage > 100 ||
      range.end_percentage < 1 ||
      range.end_percentage > 100
    ) {
      return 'Range boundaries must be whole percentages from 1 to 100.';
    }

    if (range.start_percentage > range.end_percentage) {
      return 'Range start cannot be greater than range end.';
    }

    if (
      range.penalty_rate === null ||
      range.penalty_rate < 0 ||
      range.penalty_rate > 100
    ) {
      return 'Penalty rates must be between 0 and 100.';
    }
  }

  const sorted = [...parsedRanges].sort(
    (a, b) => (a.start_percentage ?? 0) - (b.start_percentage ?? 0),
  );
  let expectedStart = 1;

  for (const range of sorted) {
    if (range.start_percentage !== expectedStart) {
      return 'Ranges must cover 1% to 100% without gaps or overlaps.';
    }
    expectedStart = (range.end_percentage ?? 0) + 1;
  }

  if (expectedStart !== 101) {
    return 'Ranges must cover 1% to 100% without gaps or overlaps.';
  }

  return null;
}

function UnsupportedProductPanel({ type }: { type: LockerType }) {
  const theme = LOCKER_TYPE_THEME[type];

  return (
    <Card className="p-0">
      <div className={cn('h-1 w-full', theme.accent)} />
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <CardTitle>{LOCKER_TYPE_LABELS[type]}</CardTitle>
          <Badge variant="outline">Not configurable yet</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Pre-liquidation penalty configuration is currently enabled for
          Goal-Lock only.
        </p>
      </CardContent>
    </Card>
  );
}

function GoalLockPenaltyEditor() {
  const type: LockerType = 'goal_lock';
  const theme = LOCKER_TYPE_THEME[type];
  const { policyEntry, isPolicyLoading } = useLockerPreLiquidationPolicy(type);
  const { savePolicy, isSavingPolicy } = useSaveLockerPreLiquidationPolicy({
    type,
  });

  const [minimumActiveMonths, setMinimumActiveMonths] = useState(
    DEFAULT_MINIMUM_ACTIVE_MONTHS,
  );
  const [note, setNote] = useState('');
  const [ranges, setRanges] = useState<Array<DraftRange>>(
    defaultGoalLockRanges,
  );

  useEffect(() => {
    if (!policyEntry) return;

    setMinimumActiveMonths(
      String(
        policyEntry.policy?.minimum_active_months ??
          policyEntry.default_minimum_active_months,
      ),
    );
    setNote(policyEntry.policy?.note ?? '');
    setRanges(
      policyEntry.policy?.ranges.length
        ? policyEntry.policy.ranges.map((range) => ({
            localId: range.id,
            start_percentage: Number(range.start_percentage).toString(),
            end_percentage: Number(range.end_percentage).toString(),
            penalty_rate: Number(range.penalty_rate).toString(),
          }))
        : defaultGoalLockRanges(),
    );
  }, [policyEntry]);

  const validationError = useMemo(
    () => validateSchedule({ minimumActiveMonths, ranges }),
    [minimumActiveMonths, ranges],
  );

  const canSubmit = !validationError && !isSavingPolicy;

  const updateRange = (
    localId: string,
    field: keyof Omit<DraftRange, 'localId'>,
    value: string,
  ) => {
    setRanges((current) =>
      current.map((range) =>
        range.localId === localId ? { ...range, [field]: value } : range,
      ),
    );
  };

  const addRange = () => {
    const highestEnd = ranges.reduce((max, range) => {
      const end = parseInteger(range.end_percentage);
      return end && end > max ? end : max;
    }, 0);
    const nextStart = Math.min(highestEnd + 1 || 1, 100);

    setRanges((current) => [
      ...current,
      {
        localId: crypto.randomUUID(),
        start_percentage: String(nextStart),
        end_percentage: '100',
        penalty_rate: '0',
      },
    ]);
  };

  const removeRange = (localId: string) => {
    setRanges((current) =>
      current.filter((range) => range.localId !== localId),
    );
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    savePolicy({
      minimum_active_months: Number(minimumActiveMonths),
      note: note.trim() || undefined,
      ranges: ranges.map((range) => ({
        start_percentage: Number(range.start_percentage),
        end_percentage: Number(range.end_percentage),
        penalty_rate: Number(range.penalty_rate),
      })),
    });
  };

  const activePolicy = policyEntry?.policy;

  return (
    <div className="space-y-5">
      <Card className="p-0">
        <div className={cn('h-1 w-full', theme.accent)} />
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <CardTitle>{LOCKER_TYPE_LABELS[type]} penalty policy</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Configure pre-liquidation penalties by withdrawal percentage.
              </p>
            </div>
            {activePolicy ? (
              <Badge variant="success" className="w-max gap-1.5">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                Active
              </Badge>
            ) : (
              <Badge variant="outline" className="w-max">
                Not set
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {isPolicyLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : (
            <>
              <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                <div className="space-y-2">
                  <Label htmlFor="minimum-active-months">
                    Minimum active months
                  </Label>
                  <Input
                    id="minimum-active-months"
                    type="number"
                    min={0}
                    step={1}
                    value={minimumActiveMonths}
                    onChange={(event) =>
                      setMinimumActiveMonths(event.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="penalty-note">
                    Reason / note{' '}
                    <span className="font-normal text-muted-foreground">
                      (optional)
                    </span>
                  </Label>
                  <Textarea
                    id="penalty-note"
                    rows={2}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="Why is this policy changing?"
                  />
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Start %</TableHead>
                      <TableHead>End %</TableHead>
                      <TableHead>Penalty rate</TableHead>
                      <TableHead className="w-16 text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ranges.map((range) => (
                      <TableRow key={range.localId}>
                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            max={100}
                            step={1}
                            value={range.start_percentage}
                            onChange={(event) =>
                              updateRange(
                                range.localId,
                                'start_percentage',
                                event.target.value,
                              )
                            }
                            aria-label="Start percentage"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            max={100}
                            step={1}
                            value={range.end_percentage}
                            onChange={(event) =>
                              updateRange(
                                range.localId,
                                'end_percentage',
                                event.target.value,
                              )
                            }
                            aria-label="End percentage"
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            step="0.0001"
                            value={range.penalty_rate}
                            onChange={(event) =>
                              updateRange(
                                range.localId,
                                'penalty_rate',
                                event.target.value,
                              )
                            }
                            aria-label="Penalty rate"
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            onClick={() => removeRange(range.localId)}
                            disabled={ranges.length === 1}
                            aria-label="Remove range"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-h-5 text-sm">
                  {validationError ? (
                    <span className="text-destructive">{validationError}</span>
                  ) : (
                    <span className="text-muted-foreground">
                      Schedule covers 1% to 100% with no gaps.
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button type="button" variant="outline" onClick={addRange}>
                    <Plus className="h-4 w-4" />
                    Add range
                  </Button>
                  <Button onClick={handleSubmit} disabled={!canSubmit}>
                    <Save className="h-4 w-4" />
                    {isSavingPolicy ? 'Saving...' : 'Save policy'}
                  </Button>
                </div>
              </div>

              {activePolicy && (
                <p className="text-xs text-muted-foreground">
                  Since {formatDateToReadableShort(activePolicy.effective_from)}
                  {activePolicy.created_by?.name
                    ? ` · Changed by ${activePolicy.created_by.name}`
                    : ''}
                </p>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MaturityPenaltyPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-medium text-foreground">
          Maturity Penalty
        </h1>
        <p className="mt-1 text-muted-foreground">
          Configure early withdrawal penalty rules for locker products.
        </p>
      </div>

      <Tabs defaultValue="goal_lock" className="w-full space-y-4">
        <TabsList className="h-auto w-max min-w-full justify-start gap-6 rounded-none border-b border-border bg-transparent p-0">
          {LOCKER_TYPES.map((type) => (
            <TabsTrigger
              key={type}
              value={type}
              className="rounded-none border-b-2 border-transparent px-1 py-3 font-medium text-muted-foreground shadow-none transition-colors hover:text-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary"
            >
              {LOCKER_TYPE_LABELS[type]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="self_lock" className="mt-4">
          <UnsupportedProductPanel type="self_lock" />
        </TabsContent>
        <TabsContent value="goal_lock" className="mt-4">
          <GoalLockPenaltyEditor />
        </TabsContent>
        <TabsContent value="cabal" className="mt-4">
          <UnsupportedProductPanel type="cabal" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
