import * as React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[var(--ny-bg)]">
      <div className="w-full max-w-lg">
        {children}
      </div>
    </div>
  );
}
