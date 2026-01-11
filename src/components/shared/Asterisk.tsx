import { cn } from "@/lib/utils";

;

export default function Asterisk({ className }: { className?: string }) {
  return (
    <span className={cn('text-destructive text-base mr-px', className)}>*</span>
  );
}
