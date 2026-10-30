"use client";

import * as React from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export function LandingFooter() {
  const t = useTranslations("landing.footer");

  return (
    <footer className="bg-[var(--ny-forest-deep)] text-white border-t border-white/10 pt-16 pb-12">
      <div className="ny-container">
        {/* Main 4-column link section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-white/10">
          {/* Brand Col (2 spans) */}
          <div className="lg:col-span-2 space-y-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-heading font-extrabold text-2xl text-white tracking-tight"
            >
              <span className="h-8 w-8 rounded-full bg-[var(--ny-forest)] flex items-center justify-center text-sm font-bold">
                N
              </span>
              <span>NiyamAI</span>
            </Link>
            <p className="text-xs text-white/70 max-w-sm leading-relaxed">
              {t("desc")}
            </p>
            <div className="pt-2">
              <span className="inline-block text-[11px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-white/10 text-[#86e2c3]">
                {t("team")}
              </span>
            </div>
          </div>

          {/* Col 1: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t("col1Title")}
            </h4>
            <ul className="space-y-2 text-xs text-white/70" role="list">
              <li>
                <Link href="/dashboard" className="hover:text-white transition-colors">
                  Compliance Dashboard
                </Link>
              </li>
              <li>
                <Link href="/licences" className="hover:text-white transition-colors">
                  Licence Tracker
                </Link>
              </li>
              <li>
                <Link href="/invoices" className="hover:text-white transition-colors">
                  Invoice Auditor
                </Link>
              </li>
              <li>
                <Link href="/calendar" className="hover:text-white transition-colors">
                  Statutory Calendar
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Licences */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t("col2Title")}
            </h4>
            <ul className="space-y-2 text-xs text-white/70" role="list">
              <li>
                <Link href="/licences" className="hover:text-white transition-colors">
                  FSSAI Food Licence
                </Link>
              </li>
              <li>
                <Link href="/licences" className="hover:text-white transition-colors">
                  Fire Safety NOC
                </Link>
              </li>
              <li>
                <Link href="/licences" className="hover:text-white transition-colors">
                  Bhopal Trade Licence
                </Link>
              </li>
              <li>
                <Link href="/renewals" className="hover:text-white transition-colors">
                  Renewal Facilitation
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Statutory & CA */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">
              {t("col3Title")}
            </h4>
            <ul className="space-y-2 text-xs text-white/70" role="list">
              <li>
                <Link href="/penalties" className="hover:text-white transition-colors">
                  Rules Directory
                </Link>
              </li>
              <li>
                <Link href="/ca" className="hover:text-white transition-colors">
                  CA Collaboration
                </Link>
              </li>
              <li>
                <Link href="/savings" className="hover:text-white transition-colors">
                  Tax Savings
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-white transition-colors">
                  Business Entity
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom disclaimer bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-white/60">
          <p className="max-w-xl text-center md:text-left">
            {t("disclaimer")}
          </p>
          <div className="flex items-center gap-4 shrink-0">
            <span>© 2026 NiyamAI</span>
            <span>·</span>
            <span>Team Dead Neurons</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

