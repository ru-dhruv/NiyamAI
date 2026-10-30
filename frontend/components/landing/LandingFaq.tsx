"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Plus, ArrowRight, HelpCircle } from "lucide-react";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";

export function LandingFaq() {
  const t = useTranslations("landing.faq");

  const faqs = [
    { q: t("q1"), a: t("a1") },
    { q: t("q2"), a: t("a2") },
    { q: t("q3"), a: t("a3") },
    { q: t("q4"), a: t("a4") },
  ];

  return (
    <section className="ny-section border-t border-[var(--ny-border)] bg-[var(--ny-surface)]" id="faq">
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
            <p className="text-base sm:text-lg text-[var(--ny-muted)] leading-relaxed">
              {t("subtitle")}
            </p>
          </Reveal>
        </div>

        {/* 2-Column Grid: FAQ list on left, Side card on right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* FAQ Accordion (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {faqs.map((faq, idx) => (
              <Reveal key={idx} delay={((idx % 4) + 1) as 1 | 2 | 3 | 4}>
                <details className="ny-faq-details group rounded-[18px] border border-[var(--ny-border)] bg-[var(--ny-bg)] p-6 transition-all duration-200 open:bg-[var(--ny-surface)] open:shadow-sm">
                  <summary className="flex items-center justify-between gap-4 font-heading font-bold text-base sm:text-lg text-[var(--ny-text)] cursor-pointer select-none">
                    <span>{faq.q}</span>
                    <span className="ny-faq-icon h-7 w-7 rounded-full bg-[var(--ny-surface)] dark:bg-white/10 border border-[var(--ny-border)] flex items-center justify-center shrink-0 text-[var(--ny-muted)] group-hover:text-[var(--ny-text)]">
                      <Plus className="h-4 w-4" aria-hidden="true" />
                    </span>
                  </summary>
                  <div className="ny-faq-body pt-4 text-sm text-[var(--ny-muted)] leading-relaxed border-t border-[var(--ny-border)] mt-4">
                    {faq.a}
                  </div>
                </details>
              </Reveal>
            ))}
          </div>

          {/* Side Card: Orange top border (4 cols) */}
          <div className="lg:col-span-4">
            <Reveal delay={2}>
              <div className="rounded-[22px] border border-[var(--ny-border)] border-t-4 border-t-[var(--ny-accent)] bg-[var(--ny-surface)] p-8 shadow-[var(--ny-shadow-1)]">
                <div className="h-10 w-10 rounded-full bg-[var(--ny-accent)]/15 text-[var(--ny-accent)] flex items-center justify-center mb-6">
                  <HelpCircle className="h-5 w-5" aria-hidden="true" />
                </div>
                <h3 className="font-heading font-bold text-2xl text-[var(--ny-text)] mb-3">
                  {t("cardTitle")}
                </h3>
                <p className="text-sm text-[var(--ny-muted)] leading-relaxed mb-8">
                  {t("cardDesc")}
                </p>
                <Link href="/dashboard" tabIndex={-1}>
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full justify-center gap-2 font-bold"
                  >
                    <span>{t("cardBtn")}</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

