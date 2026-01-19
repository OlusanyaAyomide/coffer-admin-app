'use client';

import { useRouter } from '@tanstack/react-router';
import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import SvgIcons from '@/icons/SvgIcon';
import { useTransitionContext } from '@/hooks/useTransitionContext';


type Props = {
  children: ReactNode;
  className?: string;
  iconClassName?: string;
};

export default function HeaderNavButton({ children, className, iconClassName }: Props) {
  const { BackArrow } = SvgIcons;

  // useRouter provides access to both history and navigation methods
  const router = useRouter();
  const { startTransition } = useTransitionContext();

  const handleBackNavigate = () => {
    startTransition(() => {
      // If length is 1, this is the first page in the tab session
      if (typeof window !== 'undefined' && window.history.length > 1) {
        router.history.back();
      } else {
        router.navigate({ to: '/' });
      }
    });
  };

  return (
    <div
      className={cn(
        'flex justify-between gap-2 mb-4 max-w-[1205px]',
        className,
      )}
    >
      <div className="flex items-center">
        <button
          onClick={handleBackNavigate}
          type="button"
          className="flex items-center justify-center rounded-full mr-2 group"
        >
          <BackArrow
            className={cn(
              "cursor-pointer transition-transform group-hover:-translate-x-1",
              iconClassName
            )}
          />
          <span className="text-lg ml-2">Back</span>
        </button>
      </div>

      <div className="flex justify-end">{children}</div>
    </div>
  );
}