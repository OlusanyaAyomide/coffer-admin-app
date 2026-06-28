import { useEffect, useId, useState } from 'react';
import type { ReactNode } from 'react';
import { ImageIcon, Loader2, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';

import type {
  AdminInvestmentCategory,
  AdminInvestmentSubCategory,
} from '@/types/InvestmentTypes';
import type { DocumentMetaData } from '@/types/GenericTypes';
import CloseToast from '@/components/shared/CloseToast';
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
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import useUploadRequest from '@/hooks/useUploadRequest';
import {
  useSaveInvestmentCategory,
  useSaveInvestmentSubCategory,
} from '@/hooks/useInvestmentCategories';
import { cn } from '@/lib/utils';

const MAX_ICON_BYTES = 3 * 1024 * 1024;

type UploadedDocument = DocumentMetaData & { temporary_signed_url?: string | null };

type Props = {
  category?: AdminInvestmentCategory;
  subCategory?: AdminInvestmentSubCategory;
  /** When set (and no subCategory), creates a sub-category under this category. */
  parentCategoryId?: string;
  trigger: ReactNode;
  onSaved?: () => void;
};

function IconUpload({
  iconUrl,
  onUploaded,
  onClear,
}: {
  iconUrl: string | null;
  onUploaded: (id: string, url: string | null) => void;
  onClear: () => void;
}) {
  const inputId = useId();
  const { mutateAsync, isPending } = useUploadRequest<UploadedDocument>({
    requestUrl: '/upload',
  });

  const handleSelect = async (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.error('Icon must be an image', { action: <CloseToast /> });
      return;
    }
    if (file.size > MAX_ICON_BYTES) {
      toast.error('Icon must be 3 MB or smaller', { action: <CloseToast /> });
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const doc = await mutateAsync(formData);
      onUploaded(doc.id, doc.temporary_signed_url ?? doc.url ?? null);
    } catch {
      // useUploadRequest surfaces the error toast.
    }
  };

  return (
    <div className="space-y-2">
      <Label>
        Icon{' '}
        <span className="font-normal text-muted-foreground">(optional)</span>
      </Label>
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
          {iconUrl ? (
            <PhotoProvider>
              <PhotoView src={iconUrl}>
                <img
                  src={iconUrl}
                  alt=""
                  className="h-full w-full cursor-zoom-in object-cover"
                />
              </PhotoView>
            </PhotoProvider>
          ) : (
            <ImageIcon className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <Button type="button" variant="outline" size="sm" asChild disabled={isPending}>
          <label htmlFor={inputId} className={cn('cursor-pointer', isPending && 'opacity-70')}>
            {isPending ? (
              <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="mr-1 h-3.5 w-3.5" />
            )}
            {iconUrl ? 'Replace' : 'Upload'}
          </label>
        </Button>
        {iconUrl && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClear}
            aria-label="Remove icon"
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
        <input
          id={inputId}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            handleSelect(e.target.files?.[0]);
            e.target.value = '';
          }}
          disabled={isPending}
        />
      </div>
    </div>
  );
}

export default function CategoryFormSheet({
  category,
  subCategory,
  parentCategoryId,
  trigger,
  onSaved,
}: Props) {
  const isSubCategory = Boolean(subCategory || parentCategoryId);
  const isEdit = Boolean(category || subCategory);
  const [open, setOpen] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [iconId, setIconId] = useState<string | null>(null);
  const [iconUrl, setIconUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const source = category ?? subCategory;
    setName(source?.name ?? '');
    setDescription(source?.description ?? '');
    setOrder(category?.order != null ? String(category.order) : '');
    setIsActive(source?.is_active ?? true);
    setIconId(source?.icon_id ?? null);
    setIconUrl(source?.Icon?.temporary_signed_url ?? null);
  }, [open, category, subCategory]);

  const { saveCategory, isSavingCategory } = useSaveInvestmentCategory({
    categoryId: category?.id,
    onSuccess: () => {
      setOpen(false);
      onSaved?.();
    },
  });

  const { saveSubCategory, isSavingSubCategory } = useSaveInvestmentSubCategory({
    subCategoryId: subCategory?.id,
    onSuccess: () => {
      setOpen(false);
      onSaved?.();
    },
  });

  const isSaving = isSavingCategory || isSavingSubCategory;
  const canSubmit = name.trim() !== '' && !isSaving;

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (isSubCategory) {
      saveSubCategory({
        // category_id is only accepted on create; the update DTO rejects it.
        ...(!isEdit && { category_id: parentCategoryId }),
        name: name.trim(),
        description: description.trim() || undefined,
        icon_id: iconId ?? undefined,
        ...(isEdit && { is_active: isActive }),
      });
      return;
    }
    saveCategory({
      name: name.trim(),
      description: description.trim() || undefined,
      icon_id: iconId ?? undefined,
      order: order.trim() ? Number(order) : undefined,
      ...(isEdit && { is_active: isActive }),
    });
  };

  const titleText = isSubCategory
    ? isEdit
      ? 'Edit sub-category'
      : 'New sub-category'
    : isEdit
      ? 'Edit category'
      : 'New category';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="flex w-full flex-col p-0 sm:max-w-4xl">
        <div className="h-1.5 w-full shrink-0 bg-primary" />
        <SheetHeader className="border-b border-border">
          <SheetTitle>{titleText}</SheetTitle>
          <SheetDescription>
            {isSubCategory
              ? 'Sub-categories group investments within a category.'
              : 'Categories organise investments in the marketplace and filters.'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              placeholder="e.g. Real Estate"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cat-desc">
              Description{' '}
              <span className="font-normal text-muted-foreground">
                (optional)
              </span>
            </Label>
            <Textarea
              id="cat-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {!isSubCategory && (
            <div className="space-y-2">
              <Label htmlFor="cat-order">
                Display order{' '}
                <span className="font-normal text-muted-foreground">
                  (optional)
                </span>
              </Label>
              <Input
                id="cat-order"
                type="number"
                inputMode="numeric"
                min={1}
                placeholder="1"
                value={order}
                onChange={(e) => setOrder(e.target.value)}
              />
            </div>
          )}

          <IconUpload
            iconUrl={iconUrl}
            onUploaded={(id, url) => {
              setIconId(id);
              setIconUrl(url);
            }}
            onClear={() => {
              setIconId(null);
              setIconUrl(null);
            }}
          />

          {isEdit && (
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Active</p>
                <p className="text-xs text-muted-foreground">
                  Inactive items are hidden from users.
                </p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          )}
        </div>

        <SheetFooter className="flex-row justify-end gap-2 border-t border-border">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isSaving ? 'Saving…' : isEdit ? 'Save changes' : 'Create'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
