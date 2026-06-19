import { cn } from '@/lib/utils';

interface CofferLogoProps {
  className?: string;
  /** Rendered height of the wordmark in px. */
  size?: number;
  /** Use the all-white wordmark (for dark surfaces like the navy sidebar). */
  white?: boolean;
}

/**
 * Coffer brand wordmark.
 * - Default: deep-blue mark (`public/coffer-logo.png`) for light surfaces.
 * - `white`: all-white mark (`public/logowhite.png`) for dark surfaces — needs
 *   no light chip behind it.
 */
export default function CofferLogo({ className, size = 28, white }: CofferLogoProps) {
  return (
    <img
      src={white ? '/logowhite.png' : '/coffer-logo.png'}
      alt="Coffer"
      style={{ height: size }}
      className={cn('w-auto object-contain select-none', className)}
    />
  );
}
