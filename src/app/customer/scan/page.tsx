"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QRScanner } from "@/components/customer/QRScanner";
import { Button } from "@/components/ui/Button";
import { validateQrCode } from "@/lib/firebase/firestore";

export default function ScanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateTable = async () => {
      const tableNumber = searchParams.get("table");
      const restaurantId = searchParams.get("restaurant");

      if (!tableNumber || !restaurantId) return;

      try {
        const result = await validateQrCode(
          restaurantId,
          parseInt(tableNumber)
        );
        if (result?.isValid) {
          // Store table and restaurant information
          localStorage.setItem("tableId", result.tableId);
          localStorage.setItem("restaurantId", result.restaurantId);
          // Redirect to menu
          router.push(
            `/customer/menu?table=${tableNumber}&restaurant=${restaurantId}`
          );
        } else {
          setError("Invalid QR code. Please try again or ask for assistance.");
        }
      } catch (error) {
        console.error("Error validating table:", error);
        setError("Something went wrong. Please try again.");
      }
    };

    validateTable();
  }, [searchParams, router]);

  const handleQRResult = (result: string) => {
    try {
      const url = new URL(result);
      const params = new URLSearchParams(url.search);
      const tableId = params.get("table");
      const restaurantId = params.get("restaurant");

      if (tableId && restaurantId) {
        router.push(
          `/customer/menu?table=${tableId}&restaurant=${restaurantId}`
        );
      } else {
        setError("Invalid QR code format");
      }
    } catch {
      setError("Invalid QR code");
    }
  };

  const handleSkipScanning = () => {
    router.push("/customer/menu");
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">
        Welcome to TableTap
      </h1>
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <QRScanner
        onResult={handleQRResult}
        onError={(error) => console.error("Scanner error:", error)}
      />
      <div className="mt-6 text-center">
        <p className="text-gray-600 mb-4">
          Scan the QR code on your table to start ordering
        </p>
      </div>
    </div>
  );
}
