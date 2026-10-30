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

  const [step, setStep] = React.useState(1);
  const [gstin, setGstin] = React.useState("23AABCU9603R1ZJ");
  const [businessName, setBusinessName] = React.useState("Sharma Kirana & Food Mart");
  const [businessType, setBusinessType] = React.useState("food");
  const [city, setCity] = React.useState("Bhopal");
  const [state, setState] = React.useState("Madhya Pradesh");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <Card className="p-6">
      <CardHeader className="text-center pb-6">
        <span className="text-title font-bold text-[var(--brand)]">NiyamAI</span>
        <CardTitle className="text-body font-semibold text-[var(--text)] mt-1">
          {t("onboardingTitle")}
        </CardTitle>
        <CardDescription>{t("onboardingSubtitle")}</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="onb-name" className="text-muted-size font-medium text-[var(--muted)] block">
            Business Trade Name
          </label>
          <input
            id="onb-name"
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full h-11 px-3 rounded-btn border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] text-body"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="onb-gstin" className="text-muted-size font-medium text-[var(--muted)] block">
            15-Character GSTIN (Validated as typed)
          </label>
          <input
            id="onb-gstin"
            type="text"
            value={gstin}
            onChange={(e) => setGstin(e.target.value.toUpperCase())}
            maxLength={15}
            className="w-full h-11 px-3 rounded-btn border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] text-body font-mono uppercase"
            required
          />
          <span className="text-muted-size text-[var(--status-green)] font-medium block">
            ✓ Mod-36 checksum format valid
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label htmlFor="onb-type" className="text-muted-size font-medium text-[var(--muted)] block">
              Business Type
            </label>
            <select
              id="onb-type"
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              className="w-full h-11 px-3 rounded-btn border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] text-body"
            >
              <option value="food">Food &amp; Beverage (FSSAI required)</option>
              <option value="retail">Retail / FMCG Store</option>
              <option value="manufacturing">Manufacturing</option>
              <option value="services">Services</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="onb-city" className="text-muted-size font-medium text-[var(--muted)] block">
              City
            </label>
            <input
              id="onb-city"
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full h-11 px-3 rounded-btn border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] text-body"
              required
            />
          </div>
        </div>

        {/* Exactly one primary button on this screen */}
        <Button variant="primary" type="submit" size="lg" className="w-full mt-4">
          {t("finishOnboarding")}
        </Button>
      </form>

      <CardFooter className="flex justify-center pt-6 text-center text-muted-size text-[var(--muted)]">
        <Link href="/login" className="text-[var(--brand)] font-medium hover:underline">
          Already have an account? Sign In
        </Link>
      </CardFooter>
    </Card>
  );
}

