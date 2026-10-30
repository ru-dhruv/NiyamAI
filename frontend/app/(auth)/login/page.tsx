"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [role, setRole] = React.useState<"owner" | "ca">("owner");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === "ca") {
      router.push("/ca");
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <Card className="p-6">
      <CardHeader className="text-center pb-6">
        <span className="text-title font-bold text-[var(--brand)]">NiyamAI</span>
        <CardTitle className="text-body font-semibold text-[var(--text)] mt-1">
          {t("loginTitle")}
        </CardTitle>
        <CardDescription>{t("loginSubtitle")}</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Role toggle */}
        <div className="space-y-1.5">
          <label className="text-muted-size font-medium text-[var(--muted)] block">
            Select Role
          </label>
          <div className="grid grid-cols-2 gap-2 p-1 bg-[var(--background)] border border-[var(--border)] rounded-btn">
            <button
              type="button"
              onClick={() => setRole("owner")}
              className={`py-2 text-muted-size font-medium rounded-btn transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] ${
                role === "owner"
                  ? "bg-[var(--panel)] text-[var(--brand)] border border-[var(--border)] font-semibold"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              Business Owner
            </button>
            <button
              type="button"
              onClick={() => setRole("ca")}
              className={`py-2 text-muted-size font-medium rounded-btn transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand)] ${
                role === "ca"
                  ? "bg-[var(--panel)] text-[var(--brand)] border border-[var(--border)] font-semibold"
                  : "text-[var(--muted)] hover:text-[var(--text)]"
              }`}
            >
              Chartered Accountant
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="login-email" className="text-muted-size font-medium text-[var(--muted)] block">
            {t("emailLabel")}
          </label>
          <input
            id="login-email"
            type="email"
            defaultValue={role === "owner" ? "owner@sharmakiranabhopal.in" : "ca.rajesh@vermaassociates.in"}
            className="w-full h-11 px-3 rounded-btn border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] text-body"
            required
          />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="login-pass" className="text-muted-size font-medium text-[var(--muted)] block">
            {t("passwordLabel")}
          </label>
          <input
            id="login-pass"
            type="password"
            defaultValue="••••••••"
            className="w-full h-11 px-3 rounded-btn border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] text-body"
            required
          />
        </div>

        {/* Exactly one primary button on screen */}
        <Button variant="primary" type="submit" size="lg" className="w-full mt-2">
          {t("signInButton")}
        </Button>
      </form>

      <CardFooter className="flex flex-col gap-2 pt-6 text-center text-muted-size text-[var(--muted)]">
        <div>
          New business?{" "}
          <Link href="/onboarding" className="text-[var(--brand)] font-medium hover:underline">
            Entity Onboarding
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

