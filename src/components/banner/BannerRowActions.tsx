import { Pencil } from 'lucide-react';

import type { Banner } from '@/types/BannerTypes';
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
import BannerFormSheet from '@/components/banner/BannerFormSheet';
import useUpdateBannerStatus from '@/hooks/useUpdateBannerStatus';
import useDeleteBanner from '@/hooks/useDeleteBanner';

export default function BannerRowActions({ banner }: { banner: Banner }) {
  const { updateBannerStatus, isUpdatingStatus } = useUpdateBannerStatus({
    bannerId: banner.id,
  });
  const { deleteBanner, isDeletingBanner } = useDeleteBanner({
    bannerId: banner.id,
  });

  const isPublished = banner.status === 'published';

  return (
    <div className="flex items-center justify-end gap-2">
      <BannerFormSheet
        banner={banner}
        trigger={
          <Button variant="outline" size="sm" className="gap-1.5">
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
        }
      />

      <Button
        variant="outline"
        size="sm"
        disabled={isUpdatingStatus}
        onClick={() =>
          updateBannerStatus({ status: isPublished ? 'draft' : 'published' })
        }
      >
        {isUpdatingStatus
          ? 'Saving…'
          : isPublished
            ? 'Unpublish'
            : 'Publish'}
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline" size="sm" className="text-destructive">
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete “{banner.title}”?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes the banner. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeletingBanner}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                deleteBanner(undefined);
              }}
              disabled={isDeletingBanner}
            >
              {isDeletingBanner ? 'Deleting…' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
