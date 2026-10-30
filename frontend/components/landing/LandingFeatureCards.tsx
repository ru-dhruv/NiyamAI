"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import {
  FileCheck2,
  FileSpreadsheet,
  Scale,
  Camera,
  Check,
  AlertCircle,
  Hash,
  ArrowRight,
} from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { StatusChip } from "@/components/ui/status-chip";

export function LandingFeatureCards() {
  const t = useTranslations("landing.features");

  return (
    <section className="ny-section" id="features">
      <div className="ny-container">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Reveal>
            <Eyebrow variant="green" className="mb-3">
              {t("eyebrow")}
            </Eyebrow>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-[var(--ny-text)] tracking-tight mb-4">
              {t("title")}
            </h2>
          </Reveal>
          <Reveal delay={2}>
            <p className="text-base sm:text-lg text-[var(--ny-muted)] leading-relaxed">
              {t("subtitle")}
            </p>
          </Reveal>
        </div>

        {/* 3 Cards with Mini Mockups */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Licence Scan */}
          <Reveal delay={1} className="h-full">
            <div className="rounded-[22px] border border-[var(--ny-border)] bg-[var(--ny-surface)] p-7 flex flex-col justify-between h-full shadow-[var(--ny-shadow-1)] ny-lift">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-[#e5f3ee] text-[var(--ny-forest)] dark:bg-[#0d5b44]/30 dark:text-[#38e2ae] flex items-center justify-center mb-6">
                  <FileCheck2 className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="font-heading font-bold text-xl text-[var(--ny-text)] mb-2">
                  {t("card1Title")}
                </h3>
                <p className="text-sm text-[var(--ny-muted)] leading-relaxed mb-6">
                  {t("card1Desc")}
                </p>
              </div>

              {/* Mini UI Mockup: Photo to extracted fields */}
              <div className="rounded-[16px] border border-[var(--ny-border)] bg-[var(--ny-bg)] p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[var(--ny-border)]">
                  <span className="flex items-center gap-1.5 font-bold text-[var(--ny-text)]">
                    <Camera className="h-3.5 w-3.5 text-[var(--ny-forest)]" />
                    FSSAI Licence Photo
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--ny-status-green-bg)] text-[var(--ny-status-green)]">
                    96% AI confidence
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-[var(--ny-border)]/50">
                    <span className="text-[var(--ny-muted)]">Reg. Number:</span>
                    <span className="font-mono font-medium text-[var(--ny-text)]">10014011001234</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--ny-border)]/50">
                    <span className="text-[var(--ny-muted)]">Holder Name:</span>
                    <span className="font-medium text-[var(--ny-text)]">Sharma Kirana</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[var(--ny-muted)]">Valid Till:</span>
                    <span className="font-medium text-[var(--ny-status-amber)]">2026-11-18 (20d left)</span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Card 2: Invoice Audit */}
          <Reveal delay={2} className="h-full">
            <div className="rounded-[22px] border border-[var(--ny-border)] bg-[var(--ny-surface)] p-7 flex flex-col justify-between h-full shadow-[var(--ny-shadow-1)] ny-lift">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-[#fee4e2] text-[var(--ny-status-red)] dark:bg-[#b42318]/20 flex items-center justify-center mb-6">
                  <FileSpreadsheet className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="font-heading font-bold text-xl text-[var(--ny-text)] mb-2">
                  {t("card2Title")}
                </h3>
                <p className="text-sm text-[var(--ny-muted)] leading-relaxed mb-6">
                  {t("card2Desc")}
                </p>
              </div>

              {/* Mini UI Mockup: Invoice check with High Risk chip */}
              <div className="rounded-[16px] border border-[var(--ny-border)] bg-[var(--ny-bg)] p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[var(--ny-border)]">
                  <span className="font-bold text-[var(--ny-text)]">
                    INV-2026-041 · ₹53,100
                  </span>
                  <StatusChip status="high" label="High Risk" />
                </div>
                <div className="p-2.5 rounded-[10px] bg-[var(--ny-status-red-bg)] border border-[var(--ny-status-red-border)] text-xs text-[var(--ny-status-red)] flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">GSTIN_INVALID</span>
                    <span className="text-[11px] leading-tight opacity-90">
                      Seller GSTIN fails standard Mod-36 checksum character check
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-[var(--ny-muted)] flex justify-between pt-1">
                  <span>Input tax credit blocked</span>
                  <span className="font-semibold text-[var(--ny-status-red)]">-₹8,100 ITC</span>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Card 3: Penalty Rules */}
          <Reveal delay={3} className="h-full">
            <div className="rounded-[22px] border border-[var(--ny-border)] bg-[var(--ny-surface)] p-7 flex flex-col justify-between h-full shadow-[var(--ny-shadow-1)] ny-lift">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-[#fef0c7] text-[var(--ny-status-amber)] dark:bg-[#b45309]/20 flex items-center justify-center mb-6">
                  <Scale className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="font-heading font-bold text-xl text-[var(--ny-text)] mb-2">
                  {t("card3Title")}
                </h3>
                <p className="text-sm text-[var(--ny-muted)] leading-relaxed mb-6">
                  {t("card3Desc")}
                </p>
              </div>

              {/* Mini UI Mockup: Rule code and indicative penalty */}
              <div className="rounded-[16px] border border-[var(--ny-border)] bg-[var(--ny-bg)] p-4 space-y-2.5">
                <div className="flex items-center justify-between text-xs pb-2 border-b border-[var(--ny-border)]">
                  <span className="flex items-center gap-1.5 font-bold font-mono text-[var(--ny-text)]">
                    <Hash className="h-3.5 w-3.5 text-[var(--ny-muted)]" />
                    FIRE_NOC_EXPIRED
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--ny-surface)] border border-[var(--ny-border)] text-[var(--ny-muted)]">
                    Bhopal MP
                  </span>
                </div>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-[var(--ny-border)]/50">
                    <span className="text-[var(--ny-muted)]">Statutory Basis:</span>
                    <span className="font-medium text-[var(--ny-text)]">MP Fire Services Act</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--ny-border)]/50">
                    <span className="text-[var(--ny-muted)]">Verified Date:</span>
                    <span className="font-medium text-[var(--ny-text)]">Official Gazette</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-[var(--ny-muted)]">Indicative Liability:</span>
                    <span className="font-bold text-[var(--ny-status-red)]">₹25,000 potential</span>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

