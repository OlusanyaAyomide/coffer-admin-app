'use client';

import React from 'react';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import type { LinkProps } from '@tanstack/react-router';
import { useTransitionContext } from '@/hooks/useTransitionContext';

type TransitionLinkProps = Omit<LinkProps, 'to'> & {
  to: string;
  replace?: boolean;
  as?: 'nav-link' | 'link';
  target?: string;
  className?: string;
  children: React.ReactNode;
};

export default function TransitionLink({
  to,
  children,
  replace,
  target,
  as = 'link',
  className,
  ...rest
}: TransitionLinkProps) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { startTransition } = useTransitionContext();

  // Check if link is active
  const isActive = pathname === to;

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    // Standard browser behavior for new tabs or modified clicks (cmd/ctrl)
    if (
      target === '_blank' ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    event.preventDefault();

    // Prevent redundant navigation
    if (isActive) return;

    // Trigger the transition context before navigating
    startTransition(() => {
      navigate({
        to,
        replace: replace,
      });
    });
  };

  // Logic for active styling
  const finalClassName = as === 'nav-link' && isActive
    ? `${className || ''} active`.trim()
    : className;

  return (
    <Link
      to={to as any}
      target={target}
      onClick={handleClick}
      className={finalClassName}
      data-active={as === 'nav-link' ? isActive : undefined}
      {...rest}
    >
      {children}
    </Link>
  );
}