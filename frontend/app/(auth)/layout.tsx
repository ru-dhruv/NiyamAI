import * as React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[var(--background)]">
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  );
}

