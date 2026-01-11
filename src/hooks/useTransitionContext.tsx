import { useContext } from "react";

import { TransitionContext } from "@/components/shared/context/TransitionContext";


export function useTransitionContext() {
  const context = useContext(TransitionContext);

  if (context === undefined) {
    throw new Error('useTransitionContext must be used within a TransitionProvider');
  }

  return context;
}