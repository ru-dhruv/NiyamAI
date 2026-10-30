import * as React from "react";
import { AlertCircle, RotateCcw } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/lib/utils";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  message = "Failed to load compliance data. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center border border-[var(--ny-status-red-border)] bg-[var(--ny-status-red-bg)] rounded-[22px]",
        className
      )}
      role="alert"
    >
      <AlertCircle className="h-8 w-8 text-[var(--ny-status-red)] mb-3 shrink-0" aria-hidden="true" />
      <p className="text-sm text-[var(--ny-status-red)] mb-4 max-w-sm font-medium">{message}</p>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="gap-2">
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          <span>Retry</span>
        </Button>
      )}
    </div>
  );
}
