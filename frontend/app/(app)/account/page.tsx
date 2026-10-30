"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { User, Building, Mail, Globe, Bell, Save, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/ui/error-state";
import { useLanguage } from "@/components/language-provider";
import { getBusiness, getUser } from "@/mocks/loader";
import type { Business, User as UserType } from "@/mocks/types";

export default function AccountPage() {
  const t = useTranslations("account");
  const tCommon = useTranslations("common");
  const { locale, setLocale } = useLanguage();

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
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-56 rounded-card" />
        <Skeleton className="h-44 rounded-card" />
        <Skeleton className="h-44 rounded-card" />
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
    <form onSubmit={handleSave} className="space-y-6">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-title text-[var(--text)]">{t("title")}</h1>
          <p className="text-muted-size text-[var(--muted)] mt-1">{t("subtitle")}</p>
        </div>
        {/* Exactly one primary button on this screen */}
        <Button variant="primary" type="submit" size="lg" className="gap-2 self-start sm:self-auto">
          <Save className="h-4 w-4" aria-hidden="true" />
          <span>{savedMessage ? "Settings Saved" : t("saveSettings")}</span>
        </Button>
      </div>

      {savedMessage && (
        <div className="p-3 bg-[var(--status-green-bg)] border border-[var(--status-green-border)] text-[var(--status-green)] rounded-card text-body flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Preferences and entity details updated successfully.</span>
        </div>
      )}

      {/* Form 1: Business Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building className="h-5 w-5 text-[var(--brand)]" aria-hidden="true" />
            <CardTitle className="text-body font-semibold">{t("businessSection")}</CardTitle>
          </div>
          <CardDescription>Official registration details used for automated compliance checks</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="biz-name" className="text-muted-size font-medium text-[var(--muted)] block">
                {t("businessName")}
              </label>
              <input
                id="biz-name"
                type="text"
                defaultValue={business.name}
                className="w-full h-11 px-3 rounded-btn border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] text-body"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="biz-gstin" className="text-muted-size font-medium text-[var(--muted)] block">
                {t("gstin")}
              </label>
              <input
                id="biz-gstin"
                type="text"
                defaultValue={business.gstin}
                className="w-full h-11 px-3 rounded-btn border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] text-body font-mono uppercase"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="biz-type" className="text-muted-size font-medium text-[var(--muted)] block">
                {t("businessType")}
              </label>
              <input
                id="biz-type"
                type="text"
                defaultValue={business.type}
                className="w-full h-11 px-3 rounded-btn border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] text-body capitalize"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="biz-city" className="text-muted-size font-medium text-[var(--muted)] block">
                {t("cityState")}
              </label>
              <input
                id="biz-city"
                type="text"
                defaultValue={`${business.city}, ${business.state}`}
                className="w-full h-11 px-3 rounded-btn border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] text-body"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form 2: CA Access & Collaboration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-[var(--brand)]" aria-hidden="true" />
            <CardTitle className="text-body font-semibold">{t("caSection")}</CardTitle>
          </div>
          <CardDescription>Grant your Chartered Accountant access to review flagged compliance items</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-1.5">
              <label htmlFor="ca-email" className="text-muted-size font-medium text-[var(--muted)] block">
                {t("caEmailLabel")}
              </label>
              <input
                id="ca-email"
                type="email"
                value={caEmail}
                onChange={(e) => setCaEmail(e.target.value)}
                className="w-full h-11 px-3 rounded-btn border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] text-body"
              />
            </div>
            <div className="self-end">
              <Button variant="secondary" type="button" className="h-11">
                {t("inviteCaButton")}
              </Button>
            </div>
          </div>
          <p className="text-muted-size text-[var(--muted)]">
            Invited CAs receive read-only access to invoice and licence audits and can reply in flag threads.
          </p>
        </CardContent>
      </Card>

      {/* Form 3: Notification & Language Preferences */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-[var(--brand)]" aria-hidden="true" />
              <CardTitle className="text-body font-semibold">{t("remindersSection")}</CardTitle>
            </div>
            <CardDescription>Automated statutory filing notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="reminder-channel" className="text-muted-size font-medium text-[var(--muted)] block">
                Delivery Channel
              </label>
              <select
                id="reminder-channel"
                value={reminderChannel}
                onChange={(e) => setReminderChannel(e.target.value)}
                className="w-full h-11 px-3 rounded-btn border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] text-body"
              >
                <option value="email">Email ({user.name} &lt;owner@niyamai.in&gt;)</option>
                <option value="whatsapp" disabled>WhatsApp (Coming Soon)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="reminder-days" className="text-muted-size font-medium text-[var(--muted)] block">
                Advance Warning
              </label>
              <select
                id="reminder-days"
                value={reminderDays}
                onChange={(e) => setReminderDays(e.target.value)}
                className="w-full h-11 px-3 rounded-btn border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] text-body"
              >
                <option value="60">60, 30 and 7 days before deadline</option>
                <option value="30">30 and 7 days before deadline</option>
                <option value="7">7 days before deadline only</option>
              </select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-[var(--brand)]" aria-hidden="true" />
              <CardTitle className="text-body font-semibold">{t("languageSection")}</CardTitle>
            </div>
            <CardDescription>Interface and compliance assistant language</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <label htmlFor="lang-select" className="text-muted-size font-medium text-[var(--muted)] block">
                Active Locale
              </label>
              <select
                id="lang-select"
                value={locale}
                onChange={(e) => setLocale(e.target.value as "en" | "hi")}
                className="w-full h-11 px-3 rounded-btn border border-[var(--border)] bg-[var(--panel)] text-[var(--text)] text-body"
              >
                <option value="en">English (Default)</option>
                <option value="hi">हिंदी (Hindi preview)</option>
              </select>
            </div>
            <p className="text-muted-size text-[var(--muted)]">
              Changing language updates all headings, table columns and status chips instantly.
            </p>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
