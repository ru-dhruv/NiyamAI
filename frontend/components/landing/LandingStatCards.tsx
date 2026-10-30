"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck, CheckCheck, TableProperties, Languages, Info } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { CountUp } from "@/components/ui/count-up";

export function LandingStatCards() {
  const t = useTranslations("landing.stats");

  const stats = [
    {
      value: 3,
      isNumeric: true,
      suffix: "",
      label: t("stat1Label"),
      sub: "FSSAI, Fire NOC & Trade Licence",
      icon: ShieldCheck,
    },
    {
      value: 8,
      isNumeric: true,
      suffix: " Checks",
      label: t("stat2Label"),
      sub: "Checksums, rates, totals, GSTIN",
      icon: CheckCheck,
    },
    {
      value: "Verified",
      isNumeric: false,
      suffix: "",
      label: t("stat3Label"),
      sub: "Indexed against statutory rules",
      icon: TableProperties,
    },
    {
      value: "EN & HI",
      isNumeric: false,
      suffix: "",
      label: t("stat4Label"),
      sub: "Full Devanagari script support",
      icon: Languages,
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[#edf4f0] dark:bg-[#0c1f19] border-y border-[var(--ny-border)]">
      <div className="ny-container">
        {/* Header */}
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
            <p className="text-base sm:text-lg text-[var(--ny-muted)] leading-relaxed mb-4">
              {t("subtitle")}
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--ny-surface)] border border-[var(--ny-border)] text-xs font-semibold text-[var(--ny-muted)]">
              <Info className="h-3.5 w-3.5 text-[var(--ny-forest)]" aria-hidden="true" />
              <span>{t("sampleNotice")}</span>
            </div>
          </Reveal>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Reveal key={idx} delay={((idx % 4) + 1) as 1 | 2 | 3 | 4} className="h-full">
                <div className="rounded-[22px] bg-[var(--ny-surface)] border border-[var(--ny-border)] p-6 flex flex-col justify-between h-full shadow-[var(--ny-shadow-1)] ny-lift">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-xl bg-[#e5f3ee] text-[var(--ny-forest)] dark:bg-[#0d5b44]/30 dark:text-[#38e2ae] flex items-center justify-center">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </div>
                    <span className="text-[10px] font-semibold text-[var(--ny-muted)] uppercase tracking-wider">
                      Sample Data
                    </span>
                  </div>

                  <div>
                    <div className="font-heading font-extrabold text-3xl sm:text-4xl text-[var(--ny-forest-deep)] dark:text-white mb-2">
                      {stat.isNumeric ? (
                        <CountUp end={Number(stat.value)} suffix={stat.suffix} duration={1000} />
                      ) : (
                        <span>{stat.value}</span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-[var(--ny-text)] mb-1">
                      {stat.label}
                    </h3>
                    <p className="text-xs text-[var(--ny-muted)]">
                      {stat.sub}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

