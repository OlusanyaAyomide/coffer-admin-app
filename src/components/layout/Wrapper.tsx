
import { Suspense } from 'react';

import QueryProvider from '@/components/shared/QueryProvider';
import { ThemeProvider as NextThemesProvider } from "next-themes"
import Loading from '@/components/shared/Loading';
import TailwindIndicator from '@/components/shared/TailwindIndicator';
import { Toaster } from '@/components/ui/sonner';
import TransitionProvider from '../shared/context/TransitionContext';

import ProgressBar from './ProgressBar';
// import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'

export default function WrappedApp({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<Loading />}>
      <TransitionProvider>
        <QueryProvider>
          <NextThemesProvider attribute="class" defaultTheme='light'>
            {children}
            <TailwindIndicator />
            <Toaster />
          </NextThemesProvider>
          <ProgressBar />
        </QueryProvider>
        {/* <TanStackRouterDevtoolsPanel /> */}
      </TransitionProvider>
    </Suspense>
  );
}

