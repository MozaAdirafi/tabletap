"use client";

import { AuthProvider } from "@/lib/context/AuthContext";

export function RootProvider({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
