// src/components/qr-code/QRCodeCard.tsx
'use client';

import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Card, CardContent, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

interface QRCodeCardProps {
  tableNumber: number | string;
  restaurantId: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function QRCodeCard({
  tableNumber,
  restaurantId,
  onEdit,
  onDelete,
}: QRCodeCardProps) {
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(true);
  
  // Generate QR code on component mount
  useEffect(() => {
    generateQRCode();
  }, [tableNumber, restaurantId]);
  
  const generateQRCode = async () => {
    setIsGenerating(true);
    try {
      // In a real app, you'd use the actual domain
      const menuUrl = `${window.location.origin}/menu?restaurantId=${restaurantId}&table=${tableNumber}`;
      const url = await QRCode.toDataURL(menuUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeData(url);
    } catch (err) {
      console.error('Error generating QR code:', err);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handlePrint = () => {
    if (!qrCodeData) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Table ${tableNumber} QR Code</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              text-align: center;
              padding: 20px;
            }
            .container {
              max-width: 300px;
              margin: 0 auto;
              border: 1px solid #ccc;
              padding: 20px;
              border-radius: 10px;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            h2 {
              margin-top: 10px;
              margin-bottom: 5px;
            }
            p {
              margin-top: 0;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <img src="${qrCodeData}" alt="Table QR Code" />
            <h2>Table ${tableNumber}</h2>
            <p>Scan to view menu & order</p>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Wait for image to load before printing
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };
  
  return (
    <Card className="h-full">
      <CardContent className="p-4 flex flex-col items-center">
        <div className="relative bg-white p-4 rounded-lg border border-gray-200 w-full aspect-square flex items-center justify-center mb-2">
          {isGenerating ? (
            <div className="w-full h-full flex items-center justify-center bg-gray-100 animate-pulse">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          ) : qrCodeData ? (
            <img 
              src={qrCodeData} 
              alt={`QR Code for Table ${tableNumber}`} 
              className="max-w-full max-h-full"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <p className="text-red-500 text-sm">Failed to generate QR code</p>
            </div>
          )}
        </div>
        
        <h3 className="font-medium text-center">Table {tableNumber}</h3>
      </CardContent>
      
      <CardFooter className="flex justify-between border-t p-3">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handlePrint}
          disabled={!qrCodeData}
        >
          Print
        </Button>
        
        <div className="flex space-x-2">
          {onEdit && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onEdit}
            >
              Edit
            </Button>
          )}
          
          {onDelete && (
            <Button 
              variant="danger" 
              size="sm" 
              onClick={onDelete}
            >
              Delete
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}