"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  UploadCloud,
  FileSearch,
  Binary,
  Activity,
  UserCheck,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

export function LandingHowItWorks() {
  const t = useTranslations("landing.howItWorks");

  const steps = [
    {
      num: "01",
      title: t("step1Title"),
      desc: t("step1Desc"),
      icon: UploadCloud,
    },
    {
      num: "02",
      title: t("step2Title"),
      desc: t("step2Desc"),
      icon: FileSearch,
    },
    {
      num: "03",
      title: t("step3Title"),
      desc: t("step3Desc"),
      icon: Binary,
    },
    {
      num: "04",
      title: t("step4Title"),
      desc: t("step4Desc"),
      icon: Activity,
    },
    {
      num: "05",
      title: t("step5Title"),
      desc: t("step5Desc"),
      icon: UserCheck,
    },
  ];

  return (
    <section className="py-20 md:py-28 bg-[var(--ny-forest-deep)] text-white" id="how-it-works">
      <div className="ny-container">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Reveal>
            <Eyebrow variant="light" className="mb-3 text-[#7fe0c4]">
              {t("eyebrow")}
            </Eyebrow>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-white tracking-tight mb-4">
              {t("title")}
            </h2>
          </Reveal>
          <Reveal delay={2}>
            <p className="text-base sm:text-lg text-white/70 leading-relaxed">
              {t("subtitle")}
            </p>
          </Reveal>
        </div>

        {/* 5 Numbered Steps */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 lg:gap-6 mb-16">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <Reveal key={idx} delay={((idx % 4) + 1) as 1 | 2 | 3 | 4} className="h-full">
                <div className="rounded-[22px] bg-white/5 border border-white/10 p-6 flex flex-col justify-between h-full hover:bg-white/10 transition-colors">
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <span className="font-heading font-extrabold text-2xl text-[#7fe0c4]">
                        {step.num}
                      </span>
                      <div className="h-9 w-9 rounded-full bg-white/10 flex items-center justify-center text-white/80">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </div>
                    </div>
                    <h3 className="font-heading font-bold text-lg text-white mb-2">
                      {step.title}
                    </h3>
                    <p className="text-xs text-white/70 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        {/* Two CTAs */}
        <Reveal delay={3}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" tabIndex={-1}>
              <Button
                variant="accent"
                size="lg"
                className="font-bold text-base px-8 py-3.5 gap-2"
              >
                <span>{t("btnPrimary")}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/penalties" tabIndex={-1}>
              <Button
                variant="outline"
                size="lg"
                className="font-bold text-base px-8 py-3.5 text-white border-white/30 hover:bg-white/10 gap-2"
              >
                <BookOpen className="h-4 w-4" aria-hidden="true" />
                <span>{t("btnSecondary")}</span>
              </Button>
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

