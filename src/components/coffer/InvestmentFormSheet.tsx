import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Check, Plus, Trash2 } from 'lucide-react';

import type {
  AdminInvestmentDetail,
  CreateInvestmentBody,
  DividendFrequency,
  InvestmentCurrency,
  UpdateInvestmentBody,
} from '@/types/InvestmentTypes';
import type {
  InvestmentDocument,
  InvestmentImage,
} from '@/components/coffer/InvestmentMediaUpload';
import {
  InvestmentDocumentList,
  InvestmentImageGrid,
} from '@/components/coffer/InvestmentMediaUpload';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import NumberInput from '@/components/coffer/NumberInput';
import DatePicker from '@/components/shared/DatePicker';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { DIVIDEND_FREQUENCY_LABELS } from '@/lib/cofferFormat';
import {
  useInvestmentCategories,
  useInvestmentSubCategories,
} from '@/hooks/useInvestmentCategories';
import useSaveAdminInvestment from '@/hooks/useSaveAdminInvestment';

const CURRENCIES: Array<InvestmentCurrency> = ['NGN', 'USDT'];
const FREQUENCIES: Array<DividendFrequency> = [
  'ending',
  'monthly',
  'quarterly',
  'semi_annually',
  'annually',
];

const STEPS = ['Basics', 'Pricing', 'Returns', 'Media', 'FAQs'] as const;

type HighlightRow = { label: string; value: string };

type Props = {
  /** Provide to edit; omit to create. */
  investment?: AdminInvestmentDetail;
  trigger: ReactNode;
  onSaved?: (investmentId?: string) => void;
};

function toDateInput(value: string | null | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function toNumber(value: string): number | undefined {
  const trimmed = value.trim();
  if (trimmed === '') return undefined;
  const n = Number(trimmed);
  return Number.isNaN(n) ? undefined : n;
}

function highlightsToRows(
  highlights: Record<string, unknown> | null | undefined,
): Array<HighlightRow> {
  if (!highlights || typeof highlights !== 'object') return [];
  return Object.entries(highlights).map(([label, value]) => ({
    label,
    value: String(value),
  }));
}

export default function InvestmentFormSheet({
  investment,
  trigger,
  onSaved,
}: Props) {
  const isEdit = Boolean(investment);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  // Basics
  const [title, setTitle] = useState('');
  const [subDescription, setSubDescription] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [currency, setCurrency] = useState<InvestmentCurrency>('NGN');

  // Pricing & units
  const [pricePerUnit, setPricePerUnit] = useState('');
  const [totalUnits, setTotalUnits] = useState('');
  const [minimumUnits, setMinimumUnits] = useState('1');
  const [maximumUnits, setMaximumUnits] = useState('');

  // Returns & schedule
  const [roiPercentage, setRoiPercentage] = useState('');
  const [dividendFrequency, setDividendFrequency] =
    useState<DividendFrequency>('ending');
  const [startDate, setStartDate] = useState('');
  const [durationMonths, setDurationMonths] = useState('');

  // Media
  const [images, setImages] = useState<Array<InvestmentImage>>([]);
  const [documents, setDocuments] = useState<Array<InvestmentDocument>>([]);

  // FAQs & terms
  const [faqs, setFaqs] = useState<Array<{ question: string; answer: string }>>(
    [],
  );
  const [highlights, setHighlights] = useState<Array<HighlightRow>>([]);
  const [terms, setTerms] = useState('');

  const { categories } = useInvestmentCategories({ is_active: true });
  const { subCategories } = useInvestmentSubCategories({
    categoryId: categoryId || undefined,
    is_active: true,
  });

  useEffect(() => {
    if (!open) return;
    setStep(0);
    setTitle(investment?.title ?? '');
    setSubDescription(investment?.sub_description ?? '');
    setDescription(investment?.description ?? '');
    setCategoryId(investment?.category_id ?? '');
    setSubCategoryId(investment?.sub_category_id ?? '');
    setCurrency(investment?.currency ?? 'NGN');
    setPricePerUnit(investment?.price_per_unit ?? '');
    setTotalUnits(
      investment?.total_units != null ? String(investment.total_units) : '',
    );
    setMinimumUnits(
      investment?.minimum_units_purchasable != null
        ? String(investment.minimum_units_purchasable)
        : '1',
    );
    setMaximumUnits(
      investment?.maximum_units_purchasable != null
        ? String(investment.maximum_units_purchasable)
        : '',
    );
    setRoiPercentage(investment?.roi_percentage ?? '');
    setDividendFrequency(investment?.dividend_frequency ?? 'ending');
    setStartDate(toDateInput(investment?.start_date));
    setDurationMonths(
      investment?.investment_duration_in_month != null
        ? String(investment.investment_duration_in_month)
        : '',
    );
    setImages(
      investment?.images.map((img) => ({
        document_id: img.document_id,
        url: img.document?.temporary_signed_url ?? null,
      })) ?? [],
    );
    setDocuments(
      investment?.documents.map((doc) => ({
        upload_id: doc.document_id,
        name: doc.caption ?? doc.document?.name ?? 'Document',
        url: doc.document?.temporary_signed_url ?? null,
      })) ?? [],
    );
    setFaqs([]);
    setHighlights(highlightsToRows(investment?.key_highlights));
    setTerms(investment?.terms_conditions ?? '');
  }, [open, investment]);

  const { saveInvestment, isSavingInvestment } = useSaveAdminInvestment({
    investmentId: investment?.id,
    onSuccess: (id) => {
      setOpen(false);
      onSaved?.(id);
    },
  });

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
        (toNumber(durationMonths) ?? 0) >= 1,
      images.length >= 1,
      true,
    ];
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
    images,
  ]);

  const canSubmit = stepValid.every(Boolean) && !isSavingInvestment;

  const buildHighlights = (): Record<string, unknown> | undefined => {
    const valid = highlights.filter(
      (h) => h.label.trim() !== '' && h.value.trim() !== '',
    );
    if (!valid.length) return undefined;
    return Object.fromEntries(valid.map((h) => [h.label.trim(), h.value.trim()]));
  };

  const handleSubmit = () => {
    if (!canSubmit) return;

    if (isEdit && investment) {
      const origImageIds = investment.images.map((i) => i.document_id);
      const curImageIds = images.map((i) => i.document_id);
      const origDocIds = investment.documents.map((d) => d.document_id);

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
        start_date: startDate || undefined,
        investment_duration_in_month: toNumber(durationMonths),
        dividend_frequency: dividendFrequency,
        key_highlights: buildHighlights(),
        terms_conditions: terms.trim() || undefined,
        image_ids_to_add: curImageIds.filter((id) => !origImageIds.includes(id)),
        image_ids_to_remove: origImageIds.filter(
          (id) => !curImageIds.includes(id),
        ),
        document_ids_to_add: documents
          .filter((d) => !origDocIds.includes(d.upload_id))
          .map((d) => ({ upload_id: d.upload_id, name: d.name.trim() || 'Document' })),
        document_ids_to_remove: origDocIds.filter(
          (id) => !documents.some((d) => d.upload_id === id),
        ),
      };
      saveInvestment(body);
      return;
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
      dividend_frequency: dividendFrequency,
      start_date: startDate,
      investment_duration_in_month: toNumber(durationMonths) ?? 0,
      image_ids: images.map((i) => i.document_id),
      document_ids: documents.map((d) => ({
        upload_id: d.upload_id,
        name: d.name.trim() || 'Document',
      })),
      key_highlights: buildHighlights(),
      terms_conditions: terms.trim() || undefined,
      faqs: faqs
        .filter((f) => f.question.trim() !== '' && f.answer.trim() !== '')
        .map((f) => ({ question: f.question.trim(), answer: f.answer.trim() })),
    };
    saveInvestment(body);
  };

  const isLastStep = step === STEPS.length - 1;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-[96rem]">
        <div className="h-1.5 w-full shrink-0 bg-primary" />
        <SheetHeader className="border-b border-border">
          <SheetTitle>{isEdit ? 'Edit investment' : 'New investment'}</SheetTitle>
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
                    onValueChange={(v) => {
                      setCategoryId(v);
                      setSubCategoryId('');
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
                    disabled={!categoryId}
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
            </section>
          )}

          {step === 1 && (
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="inv-price">Price per unit</Label>
                <NumberInput
                  id="inv-price"
                  allowDecimal
                  placeholder="0.00"
                  value={pricePerUnit}
                  onChange={setPricePerUnit}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inv-total">Total units</Label>
                <NumberInput
                  id="inv-total"
                  placeholder="e.g. 100"
                  value={totalUnits}
                  onChange={setTotalUnits}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="inv-min">Minimum units / purchase</Label>
                <NumberInput
                  id="inv-min"
                  value={minimumUnits}
                  onChange={setMinimumUnits}
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
                />
              </div>
            </section>
          )}

          {step === 2 && (
            <section className="space-y-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="inv-roi">ROI (%)</Label>
                  <NumberInput
                    id="inv-roi"
                    allowDecimal
                    placeholder="e.g. 15"
                    value={roiPercentage}
                    onChange={setRoiPercentage}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dividend frequency</Label>
                  <Select
                    value={dividendFrequency}
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
                <div className="space-y-2">
                  <Label>Start date</Label>
                  <DatePicker
                    placeHolderText="Pick a date"
                    showPlaceholder
                    showYear
                    className="mb-0"
                    selectedDate={startDate || undefined}
                    onDateSelect={setStartDate}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="inv-duration">Duration (months)</Label>
                  <NumberInput
                    id="inv-duration"
                    placeholder="e.g. 24"
                    value={durationMonths}
                    onChange={setDurationMonths}
                  />
                </div>
              </div>
              <p className="rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                Dividend schedules are generated automatically from the
                frequency, start date and duration. Maturity is start date +
                duration.
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
                        setHighlights(highlights.filter((_, i) => i !== index))
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
                  {!isEdit && (
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
                  )}
                </div>
                {isEdit ? (
                  <p className="rounded-md bg-muted/60 px-3 py-2 text-xs text-muted-foreground">
                    FAQs can only be set when creating an investment.
                  </p>
                ) : (
                  faqs.map((faq, index) => (
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
                              i === index ? { ...f, answer: e.target.value } : f,
                            ),
                          )
                        }
                      />
                    </div>
                  ))
                )}
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
                onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                disabled={!stepValid[step]}
              >
                Next
              </Button>
            )}
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
