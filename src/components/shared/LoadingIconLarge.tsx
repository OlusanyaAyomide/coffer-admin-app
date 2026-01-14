import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';


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
  const loader = theme === 'dark' ? '/PageLoaderDark.gif' : '/PageLoader.gif';
  return (
    <div className={cn('flex items-center justify-center h-screen', className)}>
      <img
        src={loader}
        alt="Loading..."
        width={350}
        height={350}
        className={cn(svgClassName, "text-primary")}
      />
    </div>
  );
}
