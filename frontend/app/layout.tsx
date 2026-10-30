import type { Metadata } from "next";
import { Manrope, Inter, Noto_Sans_Devanagari } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { LanguageProvider } from "@/components/language-provider";
import { AuthProvider } from "@/lib/auth";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoDeva = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  variable: "--font-noto-deva",
  display: "swap",
});

export const metadata: Metadata = {
  title: "NiyamAI — Compliance Health for Indian SMBs",
  description: "Tax, invoice and licence compliance in one Compliance Health Score",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${manrope.variable} ${inter.variable} ${notoDeva.variable}`}
    >
      <body className="min-h-screen bg-[var(--ny-bg)] text-[var(--ny-text)] font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <LanguageProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
