"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { Building, Mail, Globe, Bell, Save, CheckCircle2, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useLanguage } from "@/components/language-provider";
import { getBusiness, getUser } from "@/mocks/loader";
import { useAuth } from "@/lib/auth";
import type { Business, User as UserType } from "@/mocks/types";

export default function AccountPage() {
  const t = useTranslations("account");
  const { locale, setLocale } = useLanguage();
  const { isCA, user: authUser } = useAuth();

  const [user, setUser] = React.useState<UserType | null>(null);
  const [business, setBusiness] = React.useState<Business | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);
  const [savedMessage, setSavedMessage] = React.useState(false);

  const [caEmail, setCaEmail] = React.useState("ca.rajesh@vermaassociates.in");
  const [reminderChannel, setReminderChannel] = React.useState("email");
  const [reminderDays, setReminderDays] = React.useState("30");

  const loadAccountData = React.useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const [uData, bData] = await Promise.all([getUser(), getBusiness()]);
      setUser(uData);
      setBusiness(bData);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadAccountData();
  }, [loadAccountData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-56 rounded-[22px]" />
        <Skeleton className="h-44 rounded-[22px]" />
        <Skeleton className="h-44 rounded-[22px]" />
      </div>
    );
  }

  if (error || !business || !user) {
    return <ErrorState message="Could not load account settings." onRetry={loadAccountData} />;
  }

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 pb-12">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl text-[var(--ny-text)] tracking-tight">
            {t("title")}
          </h1>
          <p className="text-sm text-[var(--ny-muted)] mt-1">{t("subtitle")}</p>
        </div>
        {/* Exactly one primary button on this screen */}
        <Button
          variant="primary"
          type="submit"
          size="lg"
          className="gap-2 self-start sm:self-auto rounded-full font-bold text-xs"
        >
          <Save className="h-4 w-4" aria-hidden="true" />
          <span>{savedMessage ? "Settings Saved" : t("saveSettings")}</span>
        </Button>
      </div>

      {savedMessage && (
        <div className="p-4 bg-[var(--ny-status-green-bg)] border border-[var(--ny-status-green-border)] text-[var(--ny-status-green)] rounded-[20px] text-xs font-semibold flex items-center gap-2.5">
          <CheckCircle2 className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span>Preferences and entity details updated successfully in session.</span>
        </div>
      )}

      {/* Form 1: Business Details */}
      <Card className="rounded-[22px]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-[var(--ny-forest)]" aria-hidden="true" />
            <CardTitle className="font-heading font-bold text-base text-[var(--ny-text)]">
              {t("businessSection")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-[var(--ny-muted)]">
            Official registration details used for automated compliance checks
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="biz-name" className="text-xs font-semibold text-[var(--ny-muted)] block">
                {t("businessName")}
              </label>
              <input
                id="biz-name"
                type="text"
                defaultValue={business.name}
                className="w-full h-11 px-4 rounded-xl border border-[var(--ny-border)] bg-[var(--ny-bg)] text-[var(--ny-text)] text-xs font-medium"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="biz-gstin" className="text-xs font-semibold text-[var(--ny-muted)] block">
                {t("gstin")}
              </label>
              <input
                id="biz-gstin"
                type="text"
                defaultValue={business.gstin}
                className="w-full h-11 px-4 rounded-xl border border-[var(--ny-border)] bg-[var(--ny-bg)] text-[var(--ny-text)] text-xs font-mono uppercase font-bold"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="biz-type" className="text-xs font-semibold text-[var(--ny-muted)] block">
                {t("businessType")}
              </label>
              <input
                id="biz-type"
                type="text"
                defaultValue={business.type}
                className="w-full h-11 px-4 rounded-xl border border-[var(--ny-border)] bg-[var(--ny-bg)] text-[var(--ny-text)] text-xs capitalize"
              />
            </div>
            <div className="space-y-1">
              <label htmlFor="biz-city" className="text-xs font-semibold text-[var(--ny-muted)] block">
                {t("cityState")}
              </label>
              <input
                id="biz-city"
                type="text"
                defaultValue={`${business.city}, ${business.state}`}
                className="w-full h-11 px-4 rounded-xl border border-[var(--ny-border)] bg-[var(--ny-bg)] text-[var(--ny-text)] text-xs"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form 2: CA Access & Collaboration */}
      <Card className="rounded-[22px]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-[var(--ny-forest)]" aria-hidden="true" />
            <CardTitle className="font-heading font-bold text-base text-[var(--ny-text)]">
              {t("caSection")}
            </CardTitle>
          </div>
          <CardDescription className="text-xs text-[var(--ny-muted)]">
            Grant your Chartered Accountant access to review flagged compliance items
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-1">
              <label htmlFor="ca-email" className="text-xs font-semibold text-[var(--ny-muted)] block">
                {t("caEmailLabel")}
              </label>
              <input
                id="ca-email"
                type="email"
                value={caEmail}
                onChange={(e) => setCaEmail(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-[var(--ny-border)] bg-[var(--ny-bg)] text-[var(--ny-text)] text-xs font-medium"
              />
            </div>
            <div className="self-end">
              <Button variant="secondary" type="button" className="h-11 rounded-full text-xs font-bold">
                {t("inviteCaButton")}
              </Button>
            </div>
          </div>
          <p className="text-xs text-[var(--ny-muted)] leading-relaxed">
            Invited CAs receive access to invoice and licence audits and can reply in flag threads.
          </p>
        </CardContent>
      </Card>

      {/* Form 3: Notification & Language Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="rounded-[22px]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-[var(--ny-forest)]" aria-hidden="true" />
              <CardTitle className="font-heading font-bold text-base text-[var(--ny-text)]">
                {t("remindersSection")}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-[var(--ny-muted)]">
              Automated statutory filing notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="reminder-channel" className="text-xs font-semibold text-[var(--ny-muted)] block">
                Delivery Channel
              </label>
              <select
                id="reminder-channel"
                value={reminderChannel}
                onChange={(e) => setReminderChannel(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-[var(--ny-border)] bg-[var(--ny-bg)] text-[var(--ny-text)] text-xs"
              >
                <option value="email">Email (owner@niyamai.in)</option>
                <option value="whatsapp" disabled>WhatsApp (Coming Soon)</option>
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="reminder-days" className="text-xs font-semibold text-[var(--ny-muted)] block">
                Advance Warning
              </label>
              <select
                id="reminder-days"
                value={reminderDays}
                onChange={(e) => setReminderDays(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-[var(--ny-border)] bg-[var(--ny-bg)] text-[var(--ny-text)] text-xs"
              >
                <option value="60">60, 30 and 7 days before deadline</option>
                <option value="30">30 and 7 days before deadline</option>
                <option value="7">7 days before deadline only</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[22px]">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-[var(--ny-forest)]" aria-hidden="true" />
              <CardTitle className="font-heading font-bold text-base text-[var(--ny-text)]">
                {t("languageSection")}
              </CardTitle>
            </div>
            <CardDescription className="text-xs text-[var(--ny-muted)]">
              Interface and compliance assistant language
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <label htmlFor="lang-select" className="text-xs font-semibold text-[var(--ny-muted)] block">
                Active Locale
              </label>
              <select
                id="lang-select"
                value={locale}
                onChange={(e) => setLocale(e.target.value as "en" | "hi")}
                className="w-full h-11 px-4 rounded-xl border border-[var(--ny-border)] bg-[var(--ny-bg)] text-[var(--ny-text)] text-xs font-medium"
              >
                <option value="en">English (Default)</option>
                <option value="hi">हिंदी (Hindi preview)</option>
              </select>
            </div>
            <p className="text-xs text-[var(--ny-muted)] leading-relaxed">
              Changing language updates all headings, table columns and status chips instantly.
            </p>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
