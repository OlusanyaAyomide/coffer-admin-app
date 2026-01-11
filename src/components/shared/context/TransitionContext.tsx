'use client';

import { useLocation } from '@tanstack/react-router';
import {
  createContext,
  useState,
  useTransition,
  useEffect,
  useCallback,
  ReactNode
} from 'react';


interface TransitionContextType {
  isTransitioning: boolean;
  startTransition: (callback: () => void) => void;
}

export const TransitionContext = createContext<TransitionContextType | undefined>(undefined);

export default function TransitionProvider({ children }: { children: ReactNode }) {
  const [isPending, startReactTransition] = useTransition();
  const [isExiting, setIsExiting] = useState(false);

  // Use location from react-router-dom instead of usePathname
  const { pathname } = useLocation();

  // Reset the exit state once the navigation is complete
  useEffect(() => {
    setIsExiting(false);
  }, [pathname]);

  const startTransition = useCallback((callback: () => void) => {
    // 1. Trigger exit animations/loading states
    setIsExiting(true);

    // 2. Execute the navigation callback within React's transition logic
    startReactTransition(() => {
      callback();
    });
  }, []);

  // Combined state: true if we are starting to leave or waiting for the new page to render
  const isTransitioning = isExiting || isPending;

  return (
    <TransitionContext.Provider value={{ isTransitioning, startTransition }}>
      {children}
    </TransitionContext.Provider>
  );
}