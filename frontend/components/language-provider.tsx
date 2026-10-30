"use client";

import * as React from "react";
import { NextIntlClientProvider } from "next-intl";
import enMessages from "@/messages/en.json";
import hiMessages from "@/messages/hi.json";

export type Locale = "en" | "hi";

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
}

const LanguageContext = React.createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = React.useState<Locale>("en");
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("niyamai_locale") as Locale | null;
    if (stored === "en" || stored === "hi") {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = React.useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem("niyamai_locale", newLocale);
  }, []);

  const toggleLocale = React.useCallback(() => {
    setLocaleState((prev) => {
      const next = prev === "en" ? "hi" : "en";
      localStorage.setItem("niyamai_locale", next);
      return next;
    });
  }, []);

  const messages = locale === "hi" ? hiMessages : enMessages;

  return (
    <LanguageContext.Provider value={{ locale, setLocale, toggleLocale }}>
      <NextIntlClientProvider
        locale={locale}
        messages={messages}
        timeZone="Asia/Kolkata"
      >
        {children}
      </NextIntlClientProvider>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = React.useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

