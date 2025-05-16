"use client";

import { useEffect, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface QRScannerProps {
  onResult: (tableId: string) => void;
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
              // Expected format: https://yourdomain.com/table/123
              const url = new URL(decodedText);
              const tableId = url.pathname.split("/").pop();
              if (tableId) {
                html5QrCode.stop();
                setIsScanning(false);
                onResult(tableId);
              }
            } catch (e) {
              setError("Invalid QR code");
              onError?.("Invalid QR code");
            }
          },
          (error) => {
            // Ignore errors during scanning
          }
        );

        setIsScanning(true);
        setError(null);
      } catch (err) {
        setError("Failed to start camera");
        onError?.("Failed to start camera");
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
        <h2 className="text-lg font-semibold mb-4">Scan Table QR Code</h2>
        <div
          id="qr-reader"
          className="mx-auto mb-4"
          style={{ width: "300px", height: "300px" }}
        />
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <Button
          variant={isScanning ? "outline" : "primary"}
          onClick={() => setIsScanning(!isScanning)}
        >
          {isScanning ? "Stop Scanner" : "Start Scanner"}
        </Button>
      </div>
    </Card>
  );
}
