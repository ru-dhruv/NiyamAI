import * as React from "react";
import { AppShell } from "@/components/shell/AppShell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <React.Suspense fallback={null}>
      <AppShell>{children}</AppShell>
    </React.Suspense>
  );
}
