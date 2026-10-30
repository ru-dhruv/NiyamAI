"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Globe, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";
import { ThemeToggle } from "@/components/theme-toggle";

export function LandingHeader() {
  const t = useTranslations("landing.nav");
  const { locale, toggleLocale } = useLanguage();

  return (
    <header className="sticky top-0 z-30 w-full bg-[var(--ny-bg)]/90 backdrop-blur-md border-b border-[var(--ny-border)] transition-colors">
      <div className="ny-container flex items-center justify-between h-20">
        {/* Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 font-heading font-extrabold text-2xl text-[var(--ny-forest-deep)] dark:text-white tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ny-forest)] rounded-full px-2 py-1"
          aria-label="NiyamAI Homepage"
        >
          <span className="h-8 w-8 rounded-full bg-[var(--ny-forest)] text-white flex items-center justify-center text-sm font-bold shadow-sm">
            N
          </span>
          <span>NiyamAI</span>
        </Link>

        {/* Centred Navigation Links */}
        <nav className="hidden md:flex items-center gap-8" aria-label="Main Navigation">
          <a
            href="#how-it-works"
            className="text-sm font-medium text-[var(--ny-muted)] hover:text-[var(--ny-text)] transition-colors py-2"
          >
            {t("howItWorks")}
          </a>
          <a
            href="#features"
            className="text-sm font-medium text-[var(--ny-muted)] hover:text-[var(--ny-text)] transition-colors py-2"
          >
            {t("features")}
          </a>
          <a
            href="#demo"
            className="text-sm font-medium text-[var(--ny-muted)] hover:text-[var(--ny-text)] transition-colors py-2"
          >
            {t("demo")}
          </a>
          <a
            href="#faq"
            className="text-sm font-medium text-[var(--ny-muted)] hover:text-[var(--ny-text)] transition-colors py-2"
          >
            {t("faq")}
          </a>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLocale}
            className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ny-text)]"
            aria-label={`Switch language to ${locale === "en" ? "Hindi" : "English"}`}
          >
            <Globe className="h-4 w-4 text-[var(--ny-muted)]" aria-hidden="true" />
            <span>{locale === "en" ? "HI" : "EN"}</span>
          </Button>

          {/* Theme Toggle */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>

          {/* Pill CTA */}
          <Link href="/login" tabIndex={-1}>
            <Button
              variant="primary"
              size="default"
              className="gap-2 shadow-sm font-semibold"
            >
              <span>{t("tryDemo")}</span>
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

