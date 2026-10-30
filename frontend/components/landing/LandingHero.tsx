"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ShieldCheck,
  FileText,
  AlertTriangle,
  ArrowRight,
  Briefcase,
  LayoutDashboard,
  Calendar,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CountUp } from "@/components/ui/count-up";
import { Reveal } from "@/components/ui/reveal";

export function LandingHero() {
  const t = useTranslations("landing.hero");
  const [barsAnimated, setBarsAnimated] = React.useState(false);
  const mockupRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const node = mockupRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setBarsAnimated(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="pt-16 pb-20 md:pt-24 md:pb-32 overflow-hidden" id="demo">
      <div className="ny-container flex flex-col items-center text-center">
        {/* Pill Badge */}
        <Reveal>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e5f3ee] text-[var(--ny-forest)] dark:bg-[#0d5b44]/30 dark:text-[#38e2ae] border border-[var(--ny-forest)]/20 text-xs font-semibold mb-6">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{t("badge")}</span>
          </div>
        </Reveal>

        {/* Hero Headline */}
        <Reveal delay={1}>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl tracking-tight text-[var(--ny-text)] max-w-4xl leading-[1.08] mb-6">
            {t("headlinePrefix")}
            <span className="text-[var(--ny-forest)] underline decoration-[var(--ny-forest)]/30 underline-offset-8">
              {t("headlineHighlight")}
            </span>
            {t("headlineSuffix")}
          </h1>
        </Reveal>

        {/* Subtext */}
        <Reveal delay={2}>
          <p className="text-base sm:text-lg md:text-xl text-[var(--ny-muted)] max-w-2xl mx-auto leading-relaxed mb-8">
            {t("subtext")}
          </p>
        </Reveal>

        {/* CTA Buttons */}
        <Reveal delay={3}>
          <div className="flex flex-col sm:flex-row items-center gap-4 mb-3">
            <Link href="/dashboard" tabIndex={-1}>
              <Button
                variant="primary"
                size="lg"
                className="w-full sm:w-auto font-bold gap-2 text-base px-8 py-3.5"
              >
                <span>{t("tryOwner")}</span>
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </Link>
            <Link href="/ca" tabIndex={-1}>
              <Button
                variant="outline"
                size="lg"
                className="w-full sm:w-auto font-bold text-base px-8 py-3.5"
              >
                <span>{t("tryCa")}</span>
              </Button>
            </Link>
          </div>
        </Reveal>

        {/* Note */}
        <Reveal delay={4}>
          <p className="text-xs text-[var(--ny-muted)] mb-14">
            {t("note")}
          </p>
        </Reveal>

        {/* Dashboard Mockup Frame */}
        <div
          ref={mockupRef}
          className="w-full max-w-5xl rounded-[28px] sm:rounded-[36px] border border-[var(--ny-border)] bg-[var(--ny-surface)] shadow-[var(--ny-shadow-3)] overflow-hidden text-left"
        >
          {/* Mockup Window Chrome */}
          <div className="flex items-center justify-between px-6 py-3.5 border-b border-[var(--ny-border)] bg-[#f9faf9] dark:bg-[#0c201a]">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-full bg-[#f87171]/80" />
              <span className="h-3 w-3 rounded-full bg-[#fbbf24]/80" />
              <span className="h-3 w-3 rounded-full bg-[#34d399]/80" />
            </div>
            <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-[var(--ny-bg)] border border-[var(--ny-border)] text-xs text-[var(--ny-muted)] font-mono">
              <span>app.niyamai.in/dashboard</span>
            </div>
            <div className="text-xs text-[var(--ny-muted)] hidden sm:block">
              Bhopal Demo
            </div>
          </div>

          {/* Mockup Body with Sidebar & Content */}
          <div className="flex flex-col md:flex-row min-h-[460px]">
            {/* Dark Green Sidebar */}
            <div className="w-full md:w-56 bg-[var(--ny-forest-deep)] text-white p-5 flex flex-col justify-between shrink-0">
              <div>
                <div className="flex items-center gap-2.5 pb-6 border-b border-white/10 mb-5">
                  <div className="h-8 w-8 rounded-full bg-[var(--ny-forest)] flex items-center justify-center font-bold text-sm">
                    N
                  </div>
                  <div>
                    <p className="text-xs font-bold leading-tight">Sharma Kirana</p>
                    <p className="text-[10px] text-white/60">Bhopal, MP</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-full bg-[var(--ny-forest)] text-xs font-semibold text-white">
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-full text-xs text-white/70 hover:bg-white/5 transition-colors">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Licences</span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-full text-xs text-white/70 hover:bg-white/5 transition-colors">
                    <FileText className="h-4 w-4" />
                    <span>Invoices</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-full text-xs text-white/70 hover:bg-white/5 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Penalties</span>
                    </div>
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-[var(--ny-status-red)] text-white">
                      2
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 px-3 py-2 rounded-full text-xs text-white/70 hover:bg-white/5 transition-colors">
                    <Briefcase className="h-4 w-4" />
                    <span>CA Workspace</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 text-[11px] text-white/50 hidden md:block">
                Sample Session
              </div>
            </div>

            {/* Main Mockup Content Area */}
            <div className="flex-1 p-6 md:p-8 bg-[var(--ny-bg)] flex flex-col gap-6">
              {/* Row 1: KPI Tiles */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Tile 1: Health score tile (Dark Green Filled per reference spec) */}
                <div className="rounded-[18px] bg-[var(--ny-forest-deep)] text-white p-5 shadow-sm flex flex-col justify-between">
                  <span className="text-xs uppercase tracking-wider text-white/70 font-semibold">
                    Health Score
                  </span>
                  <div className="my-2">
                    <div className="text-4xl font-extrabold font-heading text-white">
                      <CountUp end={62} duration={1200} />
                      <span className="text-sm font-normal text-white/60 ml-1">/ 100</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#86e2c3] font-medium">
                    Needs Attention
                  </span>
                </div>

                {/* Tile 2: Penalty exposure */}
                <div className="rounded-[18px] bg-[var(--ny-surface)] border border-[var(--ny-border)] p-5 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-[var(--ny-muted)] font-semibold">
                      Exposure
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[var(--ny-status-amber-bg)] text-[var(--ny-status-amber)] border border-[var(--ny-status-amber-border)]">
                      Indicative
                    </span>
                  </div>
                  <div className="my-2">
                    <div className="text-3xl font-extrabold font-heading text-[var(--ny-status-red)]">
                      <CountUp end={25000} prefix="₹" duration={1200} />
                    </div>
                  </div>
                  <span className="text-[11px] text-[var(--ny-muted)]">
                    2 open statutory lapses
                  </span>
                </div>

                {/* Tile 3: Due in 30 days */}
                <div className="rounded-[18px] bg-[var(--ny-surface)] border border-[var(--ny-border)] p-5 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-[var(--ny-muted)] font-semibold">
                      Due Soon
                    </span>
                    <Clock className="h-4 w-4 text-[var(--ny-muted)]" />
                  </div>
                  <div className="my-2">
                    <div className="text-3xl font-extrabold font-heading text-[var(--ny-text)]">
                      <CountUp end={2} suffix=" Items" duration={800} />
                    </div>
                  </div>
                  <span className="text-[11px] text-[var(--ny-muted)]">
                    FSSAI &amp; GSTR-3B filings
                  </span>
                </div>
              </div>

              {/* Row 2: Score Breakdown Bar Chart + Issues List */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
                {/* Bar chart: lowest-scoring component in orange */}
                <div className="lg:col-span-7 rounded-[18px] bg-[var(--ny-surface)] border border-[var(--ny-border)] p-5 shadow-sm flex flex-col justify-between">
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--ny-border)]">
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ny-text)]">
                        Compliance Breakdown
                      </h4>
                      <p className="text-[11px] text-[var(--ny-muted)]">
                        Points allocated across 4 pillars
                      </p>
                    </div>
                    <span className="text-[10px] font-medium text-[var(--ny-muted)] bg-[var(--ny-bg)] px-2 py-0.5 rounded-full border border-[var(--ny-border)]">
                      Max 100 pts
                    </span>
                  </div>

                  {/* SVG Bar Chart with Orange Weakest Bar */}
                  <div className="py-4">
                    <svg
                      viewBox="0 0 320 130"
                      className="w-full h-32 overflow-visible"
                      role="img"
                      aria-label="Compliance score component breakdown bar chart"
                    >
                      {/* Grid lines */}
                      <line x1="0" y1="100" x2="320" y2="100" stroke="var(--ny-border)" strokeWidth="1" />
                      <line x1="0" y1="50" x2="320" y2="50" stroke="var(--ny-border)" strokeDasharray="3 3" strokeWidth="1" opacity="0.6" />

                      {/* Bar 1: Licences (20/40) - Weakest! Highlighted in Orange */}
                      <g className="cursor-pointer">
                        <rect
                          x="20"
                          y="50"
                          width="46"
                          height="50"
                          rx="6"
                          fill="var(--ny-accent)"
                          style={{
                            transformOrigin: "43px 100px",
                            transform: barsAnimated ? "scaleY(1)" : "scaleY(0)",
                            transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s",
                          }}
                        />
                        <text x="43" y="42" textAnchor="middle" fontSize="10" fontWeight="bold" fill="var(--ny-accent)">
                          20/40
                        </text>
                        <text x="43" y="116" textAnchor="middle" fontSize="9" fill="var(--ny-muted)">
                          Licences
                        </text>
                      </g>

                      {/* Bar 2: Invoices (20/30) */}
                      <g className="cursor-pointer">
                        <rect
                          x="100"
                          y="33"
                          width="46"
                          height="67"
                          rx="6"
                          fill="var(--ny-forest)"
                          style={{
                            transformOrigin: "123px 100px",
                            transform: barsAnimated ? "scaleY(1)" : "scaleY(0)",
                            transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s",
                          }}
                        />
                        <text x="123" y="25" textAnchor="middle" fontSize="10" fontWeight="bold" fill="var(--ny-forest)">
                          20/30
                        </text>
                        <text x="123" y="116" textAnchor="middle" fontSize="9" fill="var(--ny-muted)">
                          Invoices
                        </text>
                      </g>

                      {/* Bar 3: CA Flags (7/15) */}
                      <g className="cursor-pointer">
                        <rect
                          x="180"
                          y="53"
                          width="46"
                          height="47"
                          rx="6"
                          fill="var(--ny-forest)"
                          style={{
                            transformOrigin: "203px 100px",
                            transform: barsAnimated ? "scaleY(1)" : "scaleY(0)",
                            transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s",
                          }}
                        />
                        <text x="203" y="45" textAnchor="middle" fontSize="10" fontWeight="bold" fill="var(--ny-forest)">
                          7/15
                        </text>
                        <text x="203" y="116" textAnchor="middle" fontSize="9" fill="var(--ny-muted)">
                          CA Flags
                        </text>
                      </g>

                      {/* Bar 4: Filings (15/15 - full) */}
                      <g className="cursor-pointer">
                        <rect
                          x="260"
                          y="0"
                          width="46"
                          height="100"
                          rx="6"
                          fill="var(--ny-forest)"
                          style={{
                            transformOrigin: "283px 100px",
                            transform: barsAnimated ? "scaleY(1)" : "scaleY(0)",
                            transition: "transform 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s",
                          }}
                        />
                        <text x="283" y="-5" textAnchor="middle" fontSize="10" fontWeight="bold" fill="var(--ny-forest)">
                          15/15
                        </text>
                        <text x="283" y="116" textAnchor="middle" fontSize="9" fill="var(--ny-muted)">
                          Filings
                        </text>
                      </g>
                    </svg>
                  </div>

                  <div className="pt-2 border-t border-[var(--ny-border)] flex items-center justify-between text-[11px] text-[var(--ny-muted)]">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[var(--ny-accent)]" />
                      Weakest: Licences (-20 pts)
                    </span>
                    <span>Deterministic rule math</span>
                  </div>
                </div>

                {/* Issues mini-table / strip */}
                <div className="lg:col-span-5 rounded-[18px] bg-[var(--ny-surface)] border border-[var(--ny-border)] p-5 shadow-sm flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ny-text)] pb-3 border-b border-[var(--ny-border)]">
                      Lapses Requiring Fix
                    </h4>
                    <div className="space-y-3 mt-3">
                      <div className="flex items-start justify-between gap-2 p-2.5 rounded-[12px] bg-[var(--ny-status-red-bg)] border border-[var(--ny-status-red-border)]">
                        <div>
                          <p className="text-xs font-bold text-[var(--ny-status-red)]">
                            Fire NOC Expired
                          </p>
                          <p className="text-[11px] text-[var(--ny-muted)]">
                            Expired 2026-03-31
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--ny-status-red)] text-white">
                          -15 pts
                        </span>
                      </div>

                      <div className="flex items-start justify-between gap-2 p-2.5 rounded-[12px] bg-[var(--ny-status-amber-bg)] border border-[var(--ny-status-amber-border)]">
                        <div>
                          <p className="text-xs font-bold text-[var(--ny-status-amber)]">
                            FSSAI Expiring
                          </p>
                          <p className="text-[11px] text-[var(--ny-muted)]">
                            Due in 20 days (2026-11-18)
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--ny-status-amber)] text-white">
                          -5 pts
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[var(--ny-border)] flex items-center justify-between text-[11px] text-[var(--ny-muted)]">
                    <span>2 items flagged for CA review</span>
                    <span className="text-[var(--ny-forest)] font-semibold flex items-center gap-1">
                      View demo <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

