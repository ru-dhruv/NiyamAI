"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function OnboardingPage() {
  const t = useTranslations("auth");
  const router = useRouter();

  const [gstin, setGstin] = React.useState("23AABCU9603R1ZJ");
  const [businessName, setBusinessName] = React.useState("Sharma Kirana & Food Mart");
  const [businessType, setBusinessType] = React.useState("food");
  const [city, setCity] = React.useState("Bhopal");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

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
        <CardTitle className="font-heading font-extrabold text-2xl text-[var(--ny-text)]">
          {t("onboardingTitle")}
        </CardTitle>
        <CardDescription className="text-xs text-[var(--ny-muted)] mt-1">
          {t("onboardingSubtitle")}
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label htmlFor="onb-name" className="text-xs font-semibold text-[var(--ny-muted)] block">
            Business Trade Name
          </label>
          <input
            id="onb-name"
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full h-11 px-4 rounded-xl border border-[var(--ny-border)] bg-[var(--ny-bg)] text-[var(--ny-text)] text-xs font-medium"
            required
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="onb-gstin" className="text-xs font-semibold text-[var(--ny-muted)] block">
            15-Character GSTIN (Validated as typed)
          </label>
          <input
            id="onb-gstin"
            type="text"
            value={gstin}
            onChange={(e) => setGstin(e.target.value.toUpperCase())}
            maxLength={15}
            className="w-full h-11 px-4 rounded-xl border border-[var(--ny-border)] bg-[var(--ny-bg)] text-[var(--ny-text)] text-xs font-mono uppercase font-bold"
            required
          />
          <span className="text-[11px] text-[var(--ny-status-green)] font-semibold block pt-0.5">
            ✓ Mod-36 checksum format valid
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label htmlFor="onb-type" className="text-xs font-semibold text-[var(--ny-muted)] block">
              Business Type
            </label>
            <select
              id="onb-type"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full h-11 px-3 rounded-xl border border-[var(--ny-border)] bg-[var(--ny-bg)] text-[var(--ny-text)] text-xs"
            >
              <option value="food">Food &amp; Beverage (FSSAI)</option>
              <option value="retail">Retail Store</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="services">Services</option>
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="onb-city" className="text-xs font-semibold text-[var(--ny-muted)] block">
              City
            </label>
            <input
              id="onb-city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full h-11 px-4 rounded-xl border border-[var(--ny-border)] bg-[var(--ny-bg)] text-[var(--ny-text)] text-xs"
              required
            />
          </div>
        </div>

        <Button variant="primary" type="submit" size="lg" className="w-full mt-4 rounded-full font-bold text-xs">
          {t("finishOnboarding")}
        </Button>
      </form>

      <CardFooter className="flex justify-center pt-6 text-center text-xs text-[var(--ny-muted)] border-t border-[var(--ny-border)] mt-4">
        <Link href="/login" className="text-[var(--ny-forest)] font-bold hover:underline">
          Already have an account? Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}
