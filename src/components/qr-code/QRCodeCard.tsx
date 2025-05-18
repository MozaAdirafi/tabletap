// src/components/qr-code/QRCodeCard.tsx
"use client";

import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/lib/context/AuthContext";

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
  const { user } = useAuth();
  const qrValue = `${baseUrl}/customer/scan?table=${tableNumber}&restaurant=${user?.uid}`;

  const handleDownload = () => {
    const svg = document.getElementById(
      `qr-code-${tableNumber}`
    ) as HTMLElement;
    if (svg) {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();

      const svgData = new XMLSerializer().serializeToString(svg);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);

        const pngUrl = canvas.toDataURL("image/png");
        const link = document.createElement("a");
        link.download = `table-${tableNumber}-qr.png`;
        link.href = pngUrl;
        link.click();

        URL.revokeObjectURL(url);
      };
      img.src = url;
    }
    onDownload?.();
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-4">Table {tableNumber}</h3>
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
