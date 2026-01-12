'use client';

import { useEffect, useRef, useState } from 'react';
import { useLocation } from '@tanstack/react-router';
import { useTransitionContext } from '@/hooks/useTransitionContext';


const PROGRESS_STEPS = [
  { width: 20, timeout: 300 },
  { width: 30, timeout: 600 },
  { width: 45, timeout: 1200 },
  { width: 60, timeout: 2500 },
  { width: 75, timeout: 5000 },
  { width: 90, timeout: 10000 },
];

export default function ProgressBar() {
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // TanStack Router hook for location tracking
  const location = useLocation();
  const { isTransitioning } = useTransitionContext();

  const timeoutIdsRef = useRef<Array<ReturnType<typeof setTimeout>>>([]);

  const clearTimeouts = () => {
    timeoutIdsRef.current.forEach(clearTimeout);
    timeoutIdsRef.current = [];
  };

  useEffect(() => {
    if (isTransitioning) {
      setIsVisible(true);
      setProgress(0);
      clearTimeouts();

      PROGRESS_STEPS.forEach(({ width, timeout }) => {
        const id = setTimeout(() => {
          setProgress((prev) => (prev < width ? width : prev));
        }, timeout);
        timeoutIdsRef.current.push(id);
      });
    } else {
      finishProgress();
    }

    return clearTimeouts;
  }, [isTransitioning]);

  useEffect(() => {
    if (!isVisible) return;
    finishProgress();
  }, [location.pathname, location.search]);

  const finishProgress = () => {
    clearTimeouts();
    setProgress(100);

    const id = setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, 600);

    timeoutIdsRef.current.push(id);
  };

  if (!isVisible) return null;

  return (
    <div
      aria-label="progress-bar"
      className="fixed top-0 left-0 right-0 h-1 bg-primary z-9999 transition-[width] duration-500 ease-out"
      style={{
        width: `${progress}%`,
        opacity: isVisible ? 1 : 0,
      }}
    />
  );
}