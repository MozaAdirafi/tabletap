// src/app/layout.tsx
import "./globals.css";
import { Inter } from "next/font/google";
import type { Metadata } from "next";
import { RootProvider } from "@/components/providers/RootProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TableTap - Digital Menu and Ordering System",
  description: "A modern digital menu and ordering system for restaurants",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <RootProvider>
          <div className="min-h-screen bg-gray-50">{children}</div>
        </RootProvider>
      </body>
    </html>
  );
}
