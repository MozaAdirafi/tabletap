"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { QRCodeCard } from "@/components/qr-code/QRCodeCard";
import { PageHeader } from "@/components/shared/PageHeader";

import { useEffect } from "react";
import { getTablesFromDB, addTableToDB } from "@/lib/firebase/firestore";
import { useAuth } from "@/lib/context/AuthContext";
import { deleteTableFromDB } from "@/lib/firebase/firestore";

export default function QRCodesPage() {
  const { user } = useAuth();
  const [tables, setTables] = useState<{ id: string; number: number }[]>([]);
  const [newTableNumber, setNewTableNumber] = useState("");
  const [ , setLoading] = useState(true);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const restaurantId = user?.uid;
  useEffect(() => {
    const loadTables = async () => {
      if (!restaurantId) return;
      try {
        const tableData = await getTablesFromDB(restaurantId);
        setTables(tableData.sort((a, b) => a.number - b.number));
      } catch (error) {
        console.error("Error loading tables:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTables();
  }, [restaurantId]);
  const handleAddTable = async () => {
    if (!restaurantId) return;

    const tableNum = parseInt(newTableNumber);
    if (tableNum && !tables.some((t) => t.number === tableNum)) {
      try {
        await addTableToDB(restaurantId, tableNum);
        const tableData = await getTablesFromDB(restaurantId);
        setTables(tableData.sort((a, b) => a.number - b.number));
        setNewTableNumber("");
      } catch (error) {
        console.error("Error adding table:", error);
      }
    }
  };
  const handleRemoveTable = async (table: { id: string; number: number }) => {
    if (!restaurantId) return;
    try {
      await deleteTableFromDB(restaurantId, table.id);
      setTables(tables.filter((t) => t.id !== table.id));
    } catch (error) {
      console.error("Error removing table:", error);
    }
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
          {tables.map((table) => (
            <div key={`table-${table.id}`} className="relative">
              <button
                onClick={() => handleRemoveTable(table)}
                className="absolute -top-2 -right-2 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm hover:bg-red-600 z-10"
              >
                ×
              </button>
              <QRCodeCard tableNumber={table.number} baseUrl={baseUrl} />
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
