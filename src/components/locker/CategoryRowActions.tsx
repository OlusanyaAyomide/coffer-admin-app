import { Pencil } from 'lucide-react';

import type { SavingsCategory } from '@/types/LockerTypes';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import CategoryFormSheet from '@/components/locker/CategoryFormSheet';
import useDeactivateLockerCategory from '@/hooks/useDeactivateLockerCategory';
import useSaveLockerCategory from '@/hooks/useSaveLockerCategory';

export default function CategoryRowActions({
  category,
}: {
  category: SavingsCategory;
}) {
  const { deactivateCategory, isDeactivating } = useDeactivateLockerCategory({
    categoryId: category.id,
  });
  const { saveCategory, isSavingCategory } = useSaveLockerCategory({
    categoryId: category.id,
  });

  return (
    <div className="flex items-center justify-end gap-2">
      <CategoryFormSheet
        category={category}
        trigger={
          <Button variant="outline" size="sm" className="gap-1.5">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        }
      />

      {category.is_active ? (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" size="sm" className="text-destructive">
              Deactivate
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Deactivate “{category.name}”?</AlertDialogTitle>
              <AlertDialogDescription>
                The category will be hidden from new locks. Existing locks and
                cabals that already use it are not affected, and you can
                reactivate it at any time.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={isDeactivating}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={(e) => {
                  e.preventDefault();
                  deactivateCategory();
                }}
                disabled={isDeactivating}
              >
                {isDeactivating ? 'Deactivating…' : 'Deactivate'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      ) : (
        <Button
          variant="outline"
          size="sm"
          disabled={isSavingCategory}
          onClick={() => saveCategory({ is_active: true })}
        >
          {isSavingCategory ? 'Reactivating…' : 'Reactivate'}
        </Button>
      )}
    </div>
  );
}
