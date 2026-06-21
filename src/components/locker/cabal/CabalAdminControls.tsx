import { useState } from 'react';
import { toast } from 'sonner';
import { Ban, Star, StarOff } from 'lucide-react';

import type { CabalDetail, CabalStats } from '@/types/LockerTypes';
import { Button } from '@/components/ui/button';
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
import useAdminCabalActions from '@/hooks/useAdminCabalActions';

type Props = {
  cabal: CabalDetail;
  stats: CabalStats;
};

export default function CabalAdminControls({ cabal, stats }: Props) {
  const [closeOpen, setCloseOpen] = useState(false);
  const { setFeatured, isFeaturing, closeCabal, isClosing } =
    useAdminCabalActions({ cabalId: cabal.id });

  const isClosed =
    cabal.status === 'closed' || cabal.status === 'completed';
  const hasDeposits = Number(stats.total_contributed) > 0;

  const handleToggleFeatured = () => {
    const next = !cabal.is_featured;
    setFeatured(
      { is_featured: next },
      {
        onSuccess: () =>
          toast.success(
            next ? 'Cabal featured' : 'Cabal unfeatured',
          ),
      },
    );
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant="outline"
        className="gap-2"
        onClick={handleToggleFeatured}
        disabled={isFeaturing || isClosed}
      >
        {cabal.is_featured ? (
          <>
            <StarOff className="h-4 w-4" />
            Unfeature
          </>
        ) : (
          <>
            <Star className="h-4 w-4" />
            Feature
          </>
        )}
      </Button>

      <AlertDialog open={closeOpen} onOpenChange={setCloseOpen}>
        <AlertDialogTrigger asChild>
          <Button
            variant="outline"
            className="gap-2 text-destructive hover:text-destructive"
            disabled={isClosed || hasDeposits}
            title={
              hasDeposits
                ? 'Only cabals with no deposits can be closed'
                : undefined
            }
          >
            <Ban className="h-4 w-4" />
            Close cabal
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Close this cabal?</AlertDialogTitle>
            <AlertDialogDescription>
              This marks <span className="font-medium">{cabal.name}</span> as
              closed. Only cabals with no deposits can be closed, so no member
              funds are affected. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isClosing}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isClosing}
              onClick={(e) => {
                e.preventDefault();
                closeCabal({}, { onSuccess: () => setCloseOpen(false) });
              }}
            >
              {isClosing ? 'Closing…' : 'Close cabal'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
