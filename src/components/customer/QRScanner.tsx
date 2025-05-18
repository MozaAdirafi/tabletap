"use client";

import { useEffect, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface QRScannerProps {
  onResult: (result: string) => void;
  onError?: (error: string) => void;
}

export function QRScanner({ onResult, onError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let html5QrCode: Html5Qrcode;

    const startScanner = async () => {
      try {
        html5QrCode = new Html5Qrcode("qr-reader");

        await html5QrCode.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            try {
              // Now the URL will be in the format: baseUrl/customer/scan?table=X&restaurant=Y
              const url = new URL(decodedText);
              if (
                url.searchParams.has("table") &&
                url.searchParams.has("restaurant")
              ) {
                html5QrCode.stop();
                setIsScanning(false);
                onResult(decodedText);
              } else {
                throw new Error("Invalid QR code format");
              }
            } catch {
              setError("Invalid QR code");
              onError?.("Invalid QR code");
            }
          },
          () => {
            // Ignore errors during scanning
          }
        );

        setIsScanning(true);
        setError(null);
      } catch {
        setError("Could not start scanner");
        onError?.("Could not start scanner");
      }
    };

    if (isScanning) {
      startScanner();
    }

    return () => {
      if (html5QrCode?.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [isScanning, onResult, onError]);

  return (
    <Card className="p-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-4">Scan Table QR Code</h2>
        <div
          id="qr-reader"
          className="mx-auto mb-4"
          style={{ width: "300px", height: "300px" }}
        />
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <Button onClick={() => setIsScanning(!isScanning)} variant="primary">
          {isScanning ? "Stop Scanner" : "Start Scanner"}
        </Button>
      </div>
    </Card>
  );
}
