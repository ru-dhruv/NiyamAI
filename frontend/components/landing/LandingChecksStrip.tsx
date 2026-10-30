"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const STATUTORY_STANDARDS = [
  { name: "FSSAI", desc: "Food Safety & Standards Act, 2006" },
  { name: "Fire NOC", desc: "State Fire Safety Rules" },
  { name: "Trade Licence", desc: "Municipal Corporation Act" },
  { name: "GSTIN Checksum", desc: "GST Rules 2017 (Mod-36)" },
];

export function LandingChecksStrip() {
  const t = useTranslations("landing.checksStrip");

  return (
    <section className="py-12 border-y border-[var(--ny-border)] bg-[var(--ny-surface)]/60">
      <div className="ny-container">
        <Reveal>
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[var(--ny-muted)] shrink-0">
              <ShieldCheck className="h-4 w-4 text-[var(--ny-forest)]" aria-hidden="true" />
              <span>{t("title")}</span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3">
              {STATUTORY_STANDARDS.map((chip, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--ny-border)] bg-[var(--ny-surface)] shadow-sm hover:border-[var(--ny-forest)] transition-colors"
                >
                  <CheckCircle2 className="h-3.5 w-3.5 text-[var(--ny-forest)] shrink-0" aria-hidden="true" />
                  <span className="text-sm font-bold text-[var(--ny-text)]">
                    {chip.name}
                  </span>
                  <span className="text-xs text-[var(--ny-muted)] hidden sm:inline">
                    · {chip.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

