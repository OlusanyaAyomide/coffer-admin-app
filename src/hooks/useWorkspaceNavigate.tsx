
import { useLocation, useNavigate } from '@tanstack/react-router';
import { useTransitionContext } from '@/hooks/useTransitionContext';

export default function useWorkspaceNavigate() {
  const { startTransition } = useTransitionContext();
  const navigate = useNavigate();
  const location = useLocation();

  const workspaceNavigate = (to: string, options?: { replace?: boolean }) => {
    // Prevent navigation if already on the destination path
    if (location.pathname === to) {
      return;
    }

    // Start the custom transition (exit animations, etc.)
    startTransition(() => {
      navigate({
        to,
        replace: options?.replace,
      });
    });
  };

  return workspaceNavigate;
}