import * as React from "react";
import { cn } from "@/lib/utils";

interface EyebrowProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "green" | "orange" | "light" | "muted";
  children: React.ReactNode;
}

export function Eyebrow({
  variant = "green",
  className,
  children,
  ...props
}: EyebrowProps) {
  const variantStyles = {
    green: "text-[var(--ny-forest)]",
    orange: "text-[var(--ny-accent)]",
    light: "text-[#9dd2c3]",
    muted: "text-[var(--ny-muted)]",
  }[variant];

  return (
    <span
      className={cn("ny-eyebrow inline-block", variantStyles, className)}
      {...props}
    >
      {children}
    </span>
  );
}

