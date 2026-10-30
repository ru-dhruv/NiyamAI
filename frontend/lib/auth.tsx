"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import type { UserRole } from "@/mocks/types";

export interface AuthUser {
  uid: string;
  role: UserRole;
  name: string;
  email: string;
  businessId: string;
}

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isOwner: boolean;
  isCA: boolean;
  loginAs: (role: UserRole) => void;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  role: null,
  isOwner: false,
  isCA: false,
  loginAs: () => {},
  logout: () => {},
});

const STORAGE_KEY = "niyamai_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = React.useState<AuthUser | null>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore error
        }
      }
      // Default to Owner in demo mode if initialized
      return {
        uid: "usr_001",
        role: "Owner",
        name: "Ramesh Sharma",
        email: "ramesh@sharmakiranabpl.com",
        businessId: "biz_001",
      };
    }
    return null;
  });

  const loginAs = React.useCallback(
    (role: UserRole) => {
      const newUser: AuthUser = {
        uid: role === "CA" ? "usr_ca_001" : "usr_001",
        role,
        name: role === "CA" ? "CA Rajesh Verma" : "Ramesh Sharma",
        email: role === "CA" ? "rajesh@vermaassociates.in" : "ramesh@sharmakiranabpl.com",
        businessId: "biz_001",
      };
      setUser(newUser);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      }
      if (role === "CA") {
        router.push("/ca");
      } else {
        router.push("/dashboard");
      }
    },
    [router]
  );

  const logout = React.useCallback(() => {
    setUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    router.push("/login");
  }, [router]);

  // Protect app pages: if user is not signed in and visits an app route (not / or /login or /onboarding)
  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const isPublic = pathname === "/" || pathname === "/login" || pathname === "/onboarding";
    if (!user && !isPublic) {
      router.push("/login");
    }
  }, [user, pathname, router]);

  const value = React.useMemo(() => {
    const role = user?.role ?? null;
    return {
      user,
      role,
      isOwner: role === "Owner",
      isCA: role === "CA",
      loginAs,
      logout,
    };
  }, [user, loginAs, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return React.useContext(AuthContext);
}

/**
 * Real-mode Bearer token stub.
 */
export function getAuthToken(): string {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const u = JSON.parse(saved);
        return `Bearer demo-token-${u.uid}`;
      } catch {
        // ignore
      }
    }
  }
  return "Bearer demo-token-usr_001";
}
