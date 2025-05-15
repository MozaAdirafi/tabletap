// src/app/admin/qr-codes/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { QRCodeCard } from '@/components/qr-code/QRCodeCard';

interface Table {
  id: number;
  tableNumber: number;
  seats?: number;
  status: 'available' | 'occupied';
}

export default function QRCodesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingTable, setIsAddingTable] = useState(false);
  const [isEditingTable, setIsEditingTable] = useState(false);
  const [editingTableId, setEditingTableId] = useState<number | null>(null);
  const [newTableNumber, setNewTableNumber] = useState('');
  const [newTableSeats, setNewTableSeats] = useState('');
  const [selectedTables, setSelectedTables] = useState<number[]>([]);
  const [selectMode, setSelectMode] = useState(false);
  const [restaurantId] = useState('demo-restaurant');

  // Simulate loading data from API
  useEffect(() => {
    const timer = setTimeout(() => {
      setTables(sampleTables);
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handler for adding a new table
  const handleAddTable = () => {
    const tableNumber = parseInt(newTableNumber);
    const seats = newTableSeats ? parseInt(newTableSeats) : undefined;
    
    if (isNaN(tableNumber) || tableNumber <= 0) {
      alert('Please enter a valid table number');
      return;
    }
    
    // Check if table number already exists
    if (tables.some(table => table.tableNumber === tableNumber)) {
      alert('A table with this number already exists');
      return;
    }
    
    const newTable: Table = {
      id: Math.max(0, ...tables.map(t => t.id)) + 1,
      tableNumber: tableNumber,
      seats: seats,
      status: 'available'
    };
    
    setTables([...tables, newTable]);
    setNewTableNumber('');
    setNewTableSeats('');
    setIsAddingTable(false);
  };
  
  // Handler for updating a table
  const handleUpdateTable = () => {
    if (!editingTableId) return;
    
    const tableNumber = parseInt(newTableNumber);
    const seats = newTableSeats ? parseInt(newTableSeats) : undefined;
    
    if (isNaN(tableNumber) || tableNumber <= 0) {
      alert('Please enter a valid table number');
      return;
    }
    
    // Check if table number already exists (except for the current table)
    if (tables.some(table => table.tableNumber === tableNumber && table.id !== editingTableId)) {
      alert('A table with this number already exists');
      return;
    }
    
    setTables(
      tables.map(table => 
        table.id === editingTableId
          ? { ...table, tableNumber, seats }
          : table
      )
    );
    
    setNewTableNumber('');
    setNewTableSeats('');
    setIsEditingTable(false);
    setEditingTableId(null);
  };
  
  // Handler for deleting a table
  const handleDeleteTable = (tableId: number) => {
    if (confirm('Are you sure you want to delete this table?')) {
      setTables(tables.filter(table => table.id !== tableId));
    }
  };
  
  // Handler for editing a table
  const handleEditTable = (table: Table) => {
    setNewTableNumber(table.tableNumber.toString());
    setNewTableSeats(table.seats?.toString() || '');
    setEditingTableId(table.id);
    setIsEditingTable(true);
  };
  
  // Handler for toggling select mode
  const handleToggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedTables([]);
  };
  
  // Handler for selecting or deselecting a table
  const handleSelectTable = (tableId: number) => {
    if (selectedTables.includes(tableId)) {
      setSelectedTables(selectedTables.filter(id => id !== tableId));
    } else {
      setSelectedTables([...selectedTables, tableId]);
    }
  };
  
  // Handler for printing selected QR codes
  const handlePrintSelected = () => {
    alert(`Printing QR codes for tables: ${selectedTables.map(id => {
      const table = tables.find(t => t.id === id);
      return table ? table.tableNumber : '';
    }).join(', ')}`);
  };
  
  // Handler for deleting selected tables
  const handleDeleteSelected = () => {
    if (selectedTables.length === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedTables.length} selected tables?`)) {
      setTables(tables.filter(table => !selectedTables.includes(table.id)));
      setSelectedTables([]);
      setSelectMode(false);
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">QR Codes</h1>
          <p className="text-gray-500 mt-1">Manage QR codes for your restaurant tables</p>
        </div>
        
        <div className="flex gap-2">
          {selectMode ? (
            <>
              <Button
                variant="outline"
                onClick={handleToggleSelectMode}
              >
                Cancel
              </Button>
              
              <Button
                variant="primary"
                disabled={selectedTables.length === 0}
                onClick={handlePrintSelected}
              >
                Print Selected
              </Button>
              
              <Button
                variant="danger"
                disabled={selectedTables.length === 0}
                onClick={handleDeleteSelected}
              >
                Delete Selected
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleToggleSelectMode}
              >
                Select Tables
              </Button>
              
              <Button
                variant="primary"
                onClick={() => setIsAddingTable(true)}
              >
                + Add Table
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Add/Edit Table Form */}
      {(isAddingTable || isEditingTable) && (
        <Card className="mb-6">
          <CardHeader className="border-b">
            <h2 className="text-lg font-semibold">
              {isAddingTable ? 'Add New Table' : 'Edit Table'}
            </h2>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label 
                  htmlFor="tableNumber" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Table Number*
                </label>
                <Input
                  id="tableNumber"
                  type="number"
                  min="1"
                  placeholder="e.g., 1"
                  value={newTableNumber}
                  onChange={(e) => setNewTableNumber(e.target.value)}
                  required
                  fullWidth
                />
              </div>
              
              <div>
                <label 
                  htmlFor="tableSeats" 
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Seats (Optional)
                </label>
                <Input
                  id="tableSeats"
                  type="number"
                  min="1"
                  placeholder="e.g., 4"
                  value={newTableSeats}
                  onChange={(e) => setNewTableSeats(e.target.value)}
                  fullWidth
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingTable(false);
                setIsEditingTable(false);
                setEditingTableId(null);
                setNewTableNumber('');
                setNewTableSeats('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={isAddingTable ? handleAddTable : handleUpdateTable}
            >
              {isAddingTable ? 'Add Table' : 'Update Table'}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* QR Codes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array(8).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="w-full h-48 mb-3" />
                <Skeleton className="w-24 h-4 mx-auto" />
              </CardContent>
              <CardFooter className="border-t flex justify-between">
                <Skeleton className="w-16 h-8" />
                <Skeleton className="w-24 h-8" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : tables.length === 0 ? (
        <EmptyState
          title="No tables found"
          description="Add your first table to generate a QR code."
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
          }
          action={{
            label: '+ Add Table',
            onClick: () => setIsAddingTable(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {tables.map((table) => (
            <div key={table.id} className="relative">
              {selectMode && (
                <div 
                  className="absolute top-2 left-2 z-10 h-6 w-6 bg-white rounded border border-gray-300 flex items-center justify-center cursor-pointer"
                  onClick={() => handleSelectTable(table.id)}
                >
                  {selectedTables.includes(table.id) && (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary-600" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              )}
              
              <QRCodeCard
                tableNumber={table.tableNumber}
                restaurantId={restaurantId}
                onEdit={selectMode ? undefined : () => handleEditTable(table)}
                onDelete={selectMode ? undefined : () => handleDeleteTable(table.id)}
              />
            </div>
          ))}
          
          {/* Add New Table Card */}
          {!selectMode && (
            <Card 
              className="h-full bg-gray-50 border-2 border-dashed border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-center"
              onClick={() => setIsAddingTable(true)}
            >
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-700">Add New Table</h3>
                <p className="text-gray-500 text-sm mt-1">Generate a new QR code</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {/* Bulk Actions Card */}
      {tables.length > 0 && !selectMode && !isAddingTable && !isEditingTable && (
        <Card className="mt-8">
          <CardHeader className="border-b">
            <h2 className="text-lg font-semibold">Bulk Operations</h2>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-sm text-gray-600 mb-4">
              Perform operations on multiple QR codes at once to save time.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Print All QR Codes</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Generate a printable PDF with all table QR codes.
                </p>
                <Button variant="outline" fullWidth>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print All QR Codes
                </Button>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Download QR Codes</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Download all QR codes as a ZIP file with PNG images.
                </p>
                <Button variant="outline" fullWidth>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download All QR Codes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Sample data for the QR Codes page
const sampleTables: Table[] = [
  { id: 1, tableNumber: 1, seats: 2, status: 'available' },
  { id: 2, tableNumber: 2, seats: 4, status: 'available' },
  { id: 3, tableNumber: 3, seats: 4, status: 'occupied' },
  { id: 4, tableNumber: 4, seats: 6, status: 'available' },
  { id: 5, tableNumber: 5, seats: 2, status: 'available' },
  { id: 6, tableNumber: 6, seats: 8, status: 'available' },
  { id: 7, tableNumber: 7, seats: 4, status: 'occupied' },
  { id: 8, tableNumber: 8, seats: 4, status: 'available' },
];