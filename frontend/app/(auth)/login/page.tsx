"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Briefcase, User, Sparkles } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth";

export default function LoginPage() {
  const { loginAs } = useAuth();

  return (
    <Card className="rounded-[28px] border border-[var(--ny-border)] bg-[var(--ny-surface)] p-8 sm:p-10 shadow-[var(--ny-shadow-3)] max-w-lg mx-auto">
      <CardHeader className="text-center pb-6">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 font-heading font-extrabold text-2xl text-[var(--ny-forest-deep)] dark:text-white tracking-tight mb-2"
        >
          <span className="h-9 w-9 rounded-full bg-[var(--ny-forest)] text-white flex items-center justify-center text-sm font-bold shadow-sm">
            N
          </span>
          <span>NiyamAI</span>
        </Link>
        <CardTitle className="font-heading font-extrabold text-2xl sm:text-3xl text-[var(--ny-text)]">
          Demo Access
        </CardTitle>
        <CardDescription className="text-sm text-[var(--ny-muted)] mt-1">
          Select a role to explore the live compliance ledger with sample Bhopal food retail data.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Two One-Tap Demo Buttons */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="lg"
            className="w-full justify-between font-bold text-base h-13 py-3.5 rounded-full"
            onClick={() => loginAs("Owner")}
          >
            <div className="flex items-center gap-3">
              <User className="h-5 w-5" aria-hidden="true" />
              <span>Try demo as Owner</span>
            </div>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="w-full justify-between font-bold text-base h-13 py-3.5 rounded-full border-1.5"
            onClick={() => loginAs("CA")}
          >
            <div className="flex items-center gap-3">
              <Briefcase className="h-5 w-5" aria-hidden="true" />
              <span>Try demo as CA</span>
            </div>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Divider */}
        <div className="relative flex items-center justify-center my-6">
          <div className="border-t border-[var(--ny-border)] w-full" />
          <span className="bg-[var(--ny-surface)] px-3 text-xs font-semibold text-[var(--ny-muted)] uppercase tracking-wider">
            Standard Login
          </span>
        </div>

        {/* Disabled Production Login Options */}
        <div className="space-y-4 opacity-60 pointer-events-none">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--ny-muted)] uppercase tracking-wider">
              OAuth / SSO
            </span>
            <Badge variant="secondary" className="text-[10px] font-bold">
              Coming soon
            </Badge>
          </div>

          <button
            type="button"
            disabled
            className="w-full h-11 px-4 rounded-full border border-[var(--ny-border)] bg-[var(--ny-bg)] text-xs font-semibold text-[var(--ny-muted)] flex items-center justify-center gap-2"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="space-y-2 pt-2">
            <div>
              <label className="text-xs font-semibold text-[var(--ny-muted)] block mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                placeholder="name@business.in"
                className="w-full h-10 px-4 rounded-xl border border-[var(--ny-border)] bg-[var(--ny-bg)] text-xs text-[var(--ny-muted)]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-[var(--ny-muted)] block mb-1">
                Password
              </label>
              <input
                type="password"
                disabled
                placeholder="••••••••"
                className="w-full h-10 px-4 rounded-xl border border-[var(--ny-border)] bg-[var(--ny-bg)] text-xs text-[var(--ny-muted)]"
              />
            </div>
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-2 pt-4 text-center text-xs text-[var(--ny-muted)] border-t border-[var(--ny-border)]">
        <div>
          <span>New entity setup? </span>
          <Link href="/onboarding" className="text-[var(--ny-forest)] font-bold hover:underline">
            Complete Onboarding Checklist
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
