import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingHero } from "@/components/landing/LandingHero";
import { LandingChecksStrip } from "@/components/landing/LandingChecksStrip";
import { LandingFeatureCards } from "@/components/landing/LandingFeatureCards";
import { LandingStatCards } from "@/components/landing/LandingStatCards";
import { LandingHowItWorks } from "@/components/landing/LandingHowItWorks";
import { LandingQuote } from "@/components/landing/LandingQuote";
import { LandingFaq } from "@/components/landing/LandingFaq";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--ny-bg)] text-[var(--ny-text)]">
      {/* 1. Header */}
      <LandingHeader />

      <main className="flex-1">
        {/* 2. Hero */}
        <LandingHero />

        {/* 3. Statutory Checks Strip */}
        <LandingChecksStrip />

        {/* 4. Three Feature Cards */}
        <LandingFeatureCards />

        {/* 5. Four Stat Cards (Pale Sage Section) */}
        <LandingStatCards />

        {/* 6. How It Works (Dark Green Section) */}
        <LandingHowItWorks />

        {/* 7. Quote Block */}
        <LandingQuote />

        {/* 8. FAQ Accordion + Side Card */}
        <LandingFaq />
      </main>

      {/* 9. Dark Green Footer */}
      <LandingFooter />
    </div>
  );
}
