import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import type {
  SavingCategoryType,
  SavingsCategory,
} from '@/types/LockerTypes';
import { CATEGORY_TYPE_LABELS } from '@/types/LockerTypes';
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
import CategoryImageUploadField from '@/components/locker/CategoryImageUploadField';
import LucideIconPicker from '@/components/locker/LucideIconPicker';
import useSaveLockerCategory from '@/hooks/useSaveLockerCategory';

const CATEGORY_TYPES: Array<SavingCategoryType> = ['self_lock', 'goal_lock', 'both'];

type CategoryFormSheetProps = {
  /** Provide to edit; omit to create. */
  category?: SavingsCategory;
  trigger: ReactNode;
};

export default function CategoryFormSheet({
  category,
  trigger,
}: CategoryFormSheetProps) {
  const isEdit = Boolean(category);
  const [open, setOpen] = useState(false);

  const [name, setName] = useState('');
  const [type, setType] = useState<SavingCategoryType | ''>('');
  const [description, setDescription] = useState('');
  const [iconUrl, setIconUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sortOrder, setSortOrder] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Seed fields from the category each time the sheet opens (edit mode), or
  // reset to blanks for create.
  useEffect(() => {
    if (!open) return;
    setName(category?.name ?? '');
    setType(category?.type ?? '');
    setDescription(category?.description ?? '');
    setIconUrl(category?.icon_url ?? '');
    setImageUrl(category?.image_url ?? '');
    setSortOrder(
      category?.sort_order !== undefined ? String(category.sort_order) : '',
    );
    setIsActive(category?.is_active ?? true);
  }, [open, category]);

  const { saveCategory, isSavingCategory } = useSaveLockerCategory({
    categoryId: category?.id,
    onSuccess: () => setOpen(false),
  });

  const canSubmit =
    name.trim() !== '' && type !== '' && !isSavingCategory;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const parsedSort = sortOrder.trim() === '' ? undefined : Number(sortOrder);

    saveCategory({
      name: name.trim(),
      type: type as SavingCategoryType,
      description: description.trim() || undefined,
      icon_url: iconUrl.trim() || undefined,
      image_url: imageUrl.trim() || undefined,
      sort_order:
        parsedSort !== undefined && !Number.isNaN(parsedSort)
          ? parsedSort
          : undefined,
      // is_active is only meaningful on edit; create defaults to active server-side.
      ...(isEdit ? { is_active: isActive } : {}),
    });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-3xl p-0">
        {/* brand band */}
        <div className="h-1.5 w-full shrink-0 bg-brand" />
        <SheetHeader className="border-b border-border">
          <SheetTitle>
            {isEdit ? 'Edit category' : 'New category'}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? 'Update this savings category. Changes apply to where the category is shown to users.'
              : 'Create a savings category that users can tag their self-locks and goal-locks with.'}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Name</Label>
            <Input
              id="cat-name"
              placeholder="e.g. Rent, Education, Emergency"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cat-type">Applies to</Label>
            <Select
              value={type}
              onValueChange={(v) => setType(v as SavingCategoryType)}
            >
              <SelectTrigger id="cat-type" className="w-full">
                <SelectValue placeholder="Select which products use this category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_TYPES.map((t) => (
                  <SelectItem key={t} value={t}>
                    {CATEGORY_TYPE_LABELS[t]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cat-description">
              Description{' '}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              id="cat-description"
              placeholder="Short description shown alongside the category"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <LucideIconPicker
            value={iconUrl}
            onChange={setIconUrl}
            onClear={() => setIconUrl('')}
          />

          <CategoryImageUploadField
            value={imageUrl}
            onChange={setImageUrl}
            onClear={() => setImageUrl('')}
          />

          <div className="space-y-2">
            <Label htmlFor="cat-sort">
              Sort order{' '}
              <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="cat-sort"
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

          {isEdit && (
            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium text-foreground">Active</p>
                <p className="text-xs text-muted-foreground">
                  Inactive categories are hidden from new locks but keep their history.
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
            disabled={isSavingCategory}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {isSavingCategory
              ? 'Saving…'
              : isEdit
                ? 'Save changes'
                : 'Create category'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
