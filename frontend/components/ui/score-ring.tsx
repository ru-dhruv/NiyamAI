import * as React from "react";
import { cn } from "@/lib/utils";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showSubtext?: boolean;
}

export function ScoreRing({
  score,
  size = 130,
  strokeWidth = 10,
  className,
  showSubtext = true,
}: ScoreRingProps) {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  let strokeColor = "var(--ny-status-green)";
  let textColor = "text-[var(--ny-status-green)]";
  let label = "Good";

  if (clampedScore < 50) {
    strokeColor = "var(--ny-status-red)";
    textColor = "text-[var(--ny-status-red)]";
    label = "Action Required";
  } else if (clampedScore < 80) {
    strokeColor = "var(--ny-status-amber)";
    textColor = "text-[var(--ny-status-amber)]";
    label = "Needs Attention";
  }

  return (
    <div
      className={cn("flex flex-col items-center justify-center select-none", className)}
      role="meter"
      aria-valuenow={clampedScore}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Compliance Health Score: ${clampedScore} out of 100 (${label})`}
    >
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="rotate-[-90deg] transition-all duration-500 ease-out"
        >
          {/* Background Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--ny-border)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress Arc */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-3xl font-extrabold tracking-tight font-heading", textColor)}>
            {clampedScore}
          </span>
          <span className="text-xs text-[var(--ny-muted)] -mt-1 font-medium">/ 100</span>
        </div>
      </div>
      {showSubtext && (
        <span className={cn("text-xs font-semibold mt-2", textColor)}>
          {label}
        </span>
      )}
    </div>
  );
}
