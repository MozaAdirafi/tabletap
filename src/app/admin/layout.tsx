// src/app/admin/layout.tsx
"use client";

import { ReactNode } from "react";
import { useRequireAuth } from "@/lib/hooks/useRequireAuth";
import AdminNavigation from "@/components/admin/AdminNavigation";

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { loading } = useRequireAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminNavigation />

      {/* Main Content */}
      <div className="min-h-screen lg:ml-64 pt-16 lg:pt-0">
        <main className="px-4 py-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
