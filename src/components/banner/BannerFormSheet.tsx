import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import type {
  Banner,
  BannerLinkType,
  BannerStatus,
} from '@/types/BannerTypes';
import {
  BANNER_INTERNAL_ROUTES,
  BANNER_LINK_TYPE_LABELS,
} from '@/types/BannerTypes';
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
import DatePicker from '@/components/shared/DatePicker';
import CategoryImageUploadField from '@/components/locker/CategoryImageUploadField';
import useSaveBanner from '@/hooks/useSaveBanner';

const LINK_TYPES: Array<BannerLinkType> = ['none', 'internal_route', 'external_url'];
const STATUSES: Array<BannerStatus> = ['draft', 'published'];

const LINK_TARGET_HINT: Record<BannerLinkType, string> = {
  none: '',
  internal_route: 'An in-app route, e.g. /coffer or /locker.',
  external_url: 'A full https URL, e.g. https://blog.coffer.africa/post.',
};

type BannerFormSheetProps = {
  /** Provide to edit; omit to create. */
  banner?: Banner;
  trigger: ReactNode;
};

export default function BannerFormSheet({ banner, trigger }: BannerFormSheetProps) {
  const isEdit = Boolean(banner);
  const [open, setOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [linkType, setLinkType] = useState<BannerLinkType>('none');
  const [linkTarget, setLinkTarget] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [status, setStatus] = useState<BannerStatus>('draft');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');

  // Seed fields from the banner each time the sheet opens (edit), or reset for create.
  useEffect(() => {
    if (!open) return;
    setTitle(banner?.title ?? '');
    setDescription(banner?.description ?? '');
    setImageUrl(banner?.image_url ?? '');
    setLinkType(banner?.link_type ?? 'none');
    setLinkTarget(banner?.link_target ?? '');
    setSortOrder(banner?.sort_order !== undefined ? String(banner.sort_order) : '');
    setStatus(banner?.status ?? 'draft');
    setStartAt(banner?.start_at ?? '');
    setEndAt(banner?.end_at ?? '');
  }, [open, banner]);

  const { saveBanner, isSavingBanner } = useSaveBanner({
    bannerId: banner?.id,
    onSuccess: () => setOpen(false),
  });

  const needsTarget = linkType !== 'none';
  const canSubmit = useMemo(
    () =>
      title.trim() !== '' &&
      imageUrl.trim() !== '' &&
      (!needsTarget || linkTarget.trim() !== '') &&
      !isSavingBanner,
    [title, imageUrl, needsTarget, linkTarget, isSavingBanner],
  );

  const handleSubmit = () => {
    if (!canSubmit) return;

    const parsedSort = sortOrder.trim() === '' ? undefined : Number(sortOrder);

    saveBanner({
      title: title.trim(),
      description: description.trim() || undefined,
      image_url: imageUrl.trim(),
      link_type: linkType,
      // Only a real target is meaningful; clear it when there is no link.
      link_target: needsTarget ? linkTarget.trim() : undefined,
      sort_order:
        parsedSort !== undefined && !Number.isNaN(parsedSort) ? parsedSort : undefined,
      status,
      start_at: startAt || undefined,
      end_at: endAt || undefined,
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-3xl p-0">
        <div className="h-1.5 w-full shrink-0 bg-brand" />
        <SheetHeader className="border-b border-border">
          <SheetTitle>{isEdit ? 'Edit banner' : 'New banner'}</SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update this promotional banner. Published banners appear in the mobile home carousel within their schedule.'
              : 'Create a promotional banner for the mobile home carousel. Draft banners stay hidden until published.'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="banner-title">Title</Label>
            <Input
              id="banner-title"
              placeholder="e.g. Save smarter with Goal Lock"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="banner-description">
              Description{' '}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="banner-description"
              placeholder="Short supporting copy shown under the title"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <CategoryImageUploadField
            value={imageUrl}
            onChange={setImageUrl}
            onClear={() => setImageUrl('')}
            label="Banner image"
            entityName="banner image"
            folderSuffix="banners"
          />

          <div className="space-y-2">
            <Label htmlFor="banner-link-type">Link</Label>
            <Select
              value={linkType}
              onValueChange={(v) => {
                setLinkType(v as BannerLinkType);
                // Reset the target — a route and a URL aren't interchangeable.
                setLinkTarget('');
              }}
            >
              <SelectTrigger id="banner-link-type" className="w-full">
                <SelectValue placeholder="Where the banner links to" />
              </SelectTrigger>
              <SelectContent>
                {LINK_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {BANNER_LINK_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {linkType === 'internal_route' && (
            <div className="space-y-2">
              <Label htmlFor="banner-link-target">Screen</Label>
              <Select value={linkTarget} onValueChange={setLinkTarget}>
                <SelectTrigger id="banner-link-target" className="w-full">
                  <SelectValue placeholder="Choose a screen to open" />
                </SelectTrigger>
                <SelectContent>
                  {BANNER_INTERNAL_ROUTES.map((route) => (
                    <SelectItem key={route.value} value={route.value}>
                      {route.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {LINK_TARGET_HINT.internal_route}
              </p>
            </div>
          )}

          {linkType === 'external_url' && (
            <div className="space-y-2">
              <Label htmlFor="banner-link-target">Link target</Label>
              <Input
                id="banner-link-target"
                placeholder="https://…"
                value={linkTarget}
                onChange={(e) => setLinkTarget(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                {LINK_TARGET_HINT.external_url}
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label>
              Schedule{' '}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Start date</Label>
                <DatePicker
                  placeHolderText="Select date"
                  selectedDate={startAt || undefined}
                  onDateSelect={setStartAt}
                  showYear
                  showPlaceholder
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">End date</Label>
                <DatePicker
                  placeHolderText="Select date"
                  selectedDate={endAt || undefined}
                  minDate={startAt || undefined}
                  onDateSelect={setEndAt}
                  showYear
                  showPlaceholder
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Leave empty to show the banner as soon as it is published, with no
              end date.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="banner-sort">
                Sort order{' '}
                <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Input
                id="banner-sort"
                type="number"
                inputMode="numeric"
                min={0}
                placeholder="0"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first. Defaults to 0.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="banner-status">Status</Label>
              <Select
                value={status}
                onValueChange={(v) => setStatus(v as BannerStatus)}
              >
                <SelectTrigger id="banner-status" className="w-full">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s === 'draft' ? 'Draft' : 'Published'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Only published banners appear in the app.
              </p>
            </div>
          </div>
        </div>

        <SheetFooter className="flex-row justify-end gap-2 border-t border-border">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSavingBanner}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isSavingBanner
              ? 'Saving…'
              : isEdit
                ? 'Save changes'
                : 'Create banner'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
