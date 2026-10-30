"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Quote } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

export function LandingQuote() {
  const t = useTranslations("landing.quote");

  return (
    <section className="py-24 md:py-32 bg-[var(--ny-bg)]">
      <div className="ny-container max-w-4xl mx-auto text-center">
        <Reveal>
          <div className="h-12 w-12 rounded-full bg-[var(--ny-forest)]/10 text-[var(--ny-forest)] flex items-center justify-center mx-auto mb-8">
            <Quote className="h-6 w-6" aria-hidden="true" />
          </div>
        </Reveal>

        <Reveal delay={1}>
          <blockquote className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-[var(--ny-text)] tracking-tight leading-[1.12] mb-8">
            “{t("text")}”
          </blockquote>
        </Reveal>

        <Reveal delay={2}>
          <p className="text-sm sm:text-base text-[var(--ny-muted)] max-w-2xl mx-auto leading-relaxed">
            {t("explanation")}
          </p>
        </Reveal>
      </div>
    </section>
  );
}

