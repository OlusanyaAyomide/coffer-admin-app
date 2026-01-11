import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';


export function LoadingIconSmall({ className }: { className?: string }) {
  return (
    <img
      src="/ButtonLoader.svg"
      alt="Loading..."
      width={40}
      height={40}
      className={cn(className)}
    />
  );
}

export function LoadingIconLarge({ isLoading, className, svgClassName }:
  { isLoading: boolean, className?: string, svgClassName?: string }) {
  if (!isLoading) {
    return null;
  }

  const { theme } = useTheme();
  const loader = theme === 'dark' ? '/PageLoader.gif' : '/PageLoadeDark.gif';
  return (
    <div className={cn('flex items-center justify-center h-screen', className)}>
      <img
        src={loader}
        alt="Loading..."
        width={150}
        height={150}
        className={cn(svgClassName, "text-primary")}
      />
    </div>
  );
}
