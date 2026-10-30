import * as React from "react";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  AlertTriangle,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { mapRiskToTone } from "@/mocks/types";

export type ChipStatus =
  | "valid"
  | "expiring"
  | "expired"
  | "low"
  | "medium"
  | "high"
  | "Low"
  | "Medium"
  | "High"
  | "resolved"
  | "needs-info"
  | "open"
  | "active"
  | "fixed"
  | "flagged";

interface StatusChipProps {
  status: ChipStatus;
  label?: string;
  className?: string;
}

export function StatusChip({ status, label, className }: StatusChipProps) {
  let tone: "green" | "amber" | "red" = "green";
  let defaultLabel = "";
  let Icon = CheckCircle2;

  // Handle risk values using mapRiskToTone
  const normalized = status.toLowerCase();
  if (normalized === "low" || normalized === "medium" || normalized === "high") {
    const riskConfig = mapRiskToTone(normalized);
    tone = riskConfig.tone;
    defaultLabel = riskConfig.label;
    Icon = tone === "green" ? CheckCircle2 : tone === "amber" ? AlertTriangle : AlertCircle;
  } else {
    switch (status) {
      case "valid":
        tone = "green";
        defaultLabel = "Valid";
        Icon = ShieldCheck;
        break;
      case "fixed":
        tone = "green";
        defaultLabel = "Fixed";
        Icon = CheckCircle2;
        break;
      case "resolved":
        tone = "green";
        defaultLabel = "Resolved";
        Icon = CheckCircle2;
        break;
      case "expiring":
        tone = "amber";
        defaultLabel = "Expiring Soon";
        Icon = Clock;
        break;
      case "needs-info":
        tone = "amber";
        defaultLabel = "Needs Info";
        Icon = AlertTriangle;
        break;
      case "active":
        tone = "amber";
        defaultLabel = "Active";
        Icon = Clock;
        break;
      case "expired":
        tone = "red";
        defaultLabel = "Expired";
        Icon = AlertCircle;
        break;
      case "open":
        tone = "red";
        defaultLabel = "Open";
        Icon = AlertCircle;
        break;
      case "flagged":
        tone = "red";
        defaultLabel = "Flagged";
        Icon = AlertCircle;
        break;
    }
  }

  const displayLabel = label || defaultLabel;

  const toneClasses = {
    green:
      "bg-[var(--ny-status-green-bg)] text-[var(--ny-status-green)] border-[var(--ny-status-green-border)]",
    amber:
      "bg-[var(--ny-status-amber-bg)] text-[var(--ny-status-amber)] border-[var(--ny-status-amber-border)]",
    red:
      "bg-[var(--ny-status-red-bg)] text-[var(--ny-status-red)] border-[var(--ny-status-red-border)]",
  }[tone];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold select-none whitespace-nowrap",
        toneClasses,
        className
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      <span>{displayLabel}</span>
    </span>
  );
}
