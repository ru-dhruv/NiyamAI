import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;
  className?: string;
}

export function EmptyState({
  message,
  actionLabel,
  onAction,
  icon: Icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center border border-dashed border-[var(--ny-border)] rounded-[22px] bg-[var(--ny-surface)]",
        className
      )}
      role="region"
      aria-label="Empty list"
    >
      {Icon && (
        <Icon className="h-8 w-8 text-[var(--ny-muted)] mb-3 shrink-0" aria-hidden="true" />
      )}
      <p className="text-sm text-[var(--ny-muted)] mb-4 max-w-sm">{message}</p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
