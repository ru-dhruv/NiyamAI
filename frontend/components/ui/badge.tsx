import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--ny-forest)] text-white",
        secondary:
          "border-[var(--ny-border)] bg-[var(--ny-surface)] text-[var(--ny-muted)]",
        outline:
          "border-[var(--ny-border)] text-[var(--ny-text)]",
        notification:
          "border-transparent bg-[var(--ny-status-red)] text-white font-bold text-[11px] px-1.5 py-0 min-w-[18px] justify-center",
        accent:
          "border-transparent bg-[var(--ny-accent)]/20 text-[#96370e] dark:text-[#f8a882] border-[var(--ny-accent)]/40",
        forest:
          "border-transparent bg-[#e5f3ee] text-[var(--ny-forest)] dark:bg-[#0d5b44]/30 dark:text-[#42e8b2]",
      },
    },
    defaultVariants: {
      variant: "secondary",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
