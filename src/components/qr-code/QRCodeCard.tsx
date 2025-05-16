// src/components/qr-code/QRCodeCard.tsx
"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeCardProps {
  tableNumber: number;
  baseUrl: string;
  onDownload?: () => void;
}

export function QRCodeCard({
  tableNumber,
  baseUrl,
  onDownload,
}: QRCodeCardProps) {
  const qrValue = `${baseUrl}/customer/scan?table=${tableNumber}`;

  const handleDownload = () => {
    const canvas = document.getElementById(
      `qr-code-${tableNumber}`
    ) as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = `table-${tableNumber}-qr.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    onDownload?.();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Table {tableNumber}</h3>{" "}
          <div className="flex justify-center mb-4">
            <QRCodeSVG
              id={`qr-code-${tableNumber}`}
              value={qrValue}
              size={200}
              level="H"
              includeMargin={true}
            />
          </div>
          <Button variant="outline" className="w-full" onClick={handleDownload}>
            Download QR Code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
