"use client";

import { useRouter } from "next/navigation";
import { QRScanner } from "@/components/customer/QRScanner";
import { Button } from "@/components/ui/Button";

export default function ScanPage() {
  const router = useRouter();

  const handleQRResult = (tableId: string) => {
    // Store table information
    localStorage.setItem("tableId", tableId);
    // Redirect to menu
    router.push(`/customer/menu?table=${tableId}`);
  };

  const handleSkipScanning = () => {
    router.push("/customer/menu");
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold text-center mb-6">
        Welcome to TableTap
      </h1>
      <QRScanner
        onResult={handleQRResult}
        onError={(error) => console.error("Scanner error:", error)}
      />
      <div className="mt-6 text-center">
        <p className="text-gray-600 mb-4">
          Scan the QR code on your table to start ordering
        </p>
        <Button variant="outline" onClick={handleSkipScanning}>
          Skip QR Scanning
        </Button>
      </div>
    </div>
  );
}
