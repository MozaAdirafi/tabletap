"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { QRCodeCard } from "@/components/qr-code/QRCodeCard";
import { PageHeader } from "@/components/shared/PageHeader";

export default function QRCodesPage() {
  const [tables, setTables] = useState<number[]>([]);
  const [newTableNumber, setNewTableNumber] = useState("");
  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""; // Safe access to window

  const handleAddTable = () => {
    const tableNum = parseInt(newTableNumber);
    if (tableNum && !tables.includes(tableNum)) {
      setTables([...tables, tableNum].sort((a, b) => a - b));
      setNewTableNumber("");
    }
  };

  const handleRemoveTable = (tableNumber: number) => {
    setTables(tables.filter((t) => t !== tableNumber));
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <PageHeader
        title="QR Code Management"
        description="Generate and manage QR codes for your restaurant tables"
      />

      <Card className="p-4 mb-8">
        <div className="flex gap-4">
          <Input
            type="number"
            placeholder="Enter table number"
            value={newTableNumber}
            onChange={(e) => setNewTableNumber(e.target.value)}
            className="max-w-xs"
          />
          <Button onClick={handleAddTable}>Add Table</Button>
        </div>
      </Card>

      {tables.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No tables added yet. Add a table number to generate its QR code.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tables.map((tableNum) => (
            <div key={tableNum} className="relative">
              <button
                onClick={() => handleRemoveTable(tableNum)}
                className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm hover:bg-red-600 z-10"
              >
                ×
              </button>
              <QRCodeCard tableNumber={tableNum} baseUrl={baseUrl} />
            </div>
          ))}
        </div>
      )}

      {tables.length > 0 && (
        <div className="mt-8 text-center text-gray-600">
          <p>Print these QR codes and place them on their respective tables.</p>
          <p>Customers can scan these codes to start ordering.</p>
        </div>
      )}
    </div>
  );
}
