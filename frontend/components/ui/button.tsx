import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ny-forest)] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-h-[44px] px-5 py-2 cursor-pointer select-none active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--ny-forest-deep)] text-white hover:bg-[#12382e] border border-transparent shadow-[var(--ny-shadow-1)] hover:shadow-[var(--ny-shadow-2)] hover:-translate-y-0.5",
        secondary:
          "bg-[var(--ny-surface)] text-[var(--ny-text)] border border-[var(--ny-border)] hover:bg-[var(--ny-bg)] shadow-[var(--ny-shadow-1)]",
        outline:
          "border-1.5 border-[var(--ny-forest-deep)] bg-transparent text-[var(--ny-forest-deep)] dark:text-[#e6f0ec] dark:border-[var(--ny-border)] hover:bg-[var(--ny-forest-deep)]/10 hover:-translate-y-0.5",
        accent:
          "bg-[var(--ny-accent)] text-[#1a0d07] hover:opacity-95 shadow-[var(--ny-shadow-1)] hover:shadow-[var(--ny-shadow-2)] hover:-translate-y-0.5",
        ghost:
          "hover:bg-[var(--ny-bg)] text-[var(--ny-text)] border border-transparent",
        danger:
          "bg-[var(--ny-status-red-bg)] text-[var(--ny-status-red)] border border-[var(--ny-status-red-border)] hover:opacity-90",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 px-4 text-xs min-h-[36px]",
        lg: "h-12 px-8 text-base",
        icon: "h-11 w-11 p-0 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
