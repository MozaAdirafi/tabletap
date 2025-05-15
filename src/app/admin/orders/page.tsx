// src/app/admin/orders/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent} from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/shared/EmptyState';

// Define types for the orders
type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  options?: {
    name: string;
    price: number;
  }[];
  specialInstructions?: string;
}

interface Order {
  id: string;
  tableNumber: number;
  status: OrderStatus;
  items: OrderItem[];
  totalAmount: number;
  timestamp: Date;
  paymentMethod: string;
  specialRequests?: string;
}

export default function OrdersPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);

  // Simulate fetching orders from an API
  useEffect(() => {
    const timer = setTimeout(() => {
      setOrders(sampleOrders);
      setFilteredOrders(sampleOrders);
      setIsLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Filter orders when filters change
  useEffect(() => {
    let result = [...orders];
    
    // Filter by status
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Filter by search term (order ID or table number)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        order => 
          order.id.toLowerCase().includes(term) || 
          `table ${order.tableNumber}`.toLowerCase().includes(term)
      );
    }
    
    setFilteredOrders(result);
  }, [orders, statusFilter, searchTerm]);

  // Handler for updating order status
  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(
      orders.map(order => 
        order.id === orderId 
          ? { ...order, status: newStatus } 
          : order
      )
    );
    
    // If this is the selected order, update it as well
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  // Helper to get status badge variant
  const getStatusVariant = (status: OrderStatus) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'preparing': return 'primary';
      case 'ready': return 'secondary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  };

  // Helper to format the timestamp
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  // Helper to format the date
  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };
  
  // Get next status based on current status
  const getNextStatus = (status: OrderStatus): OrderStatus | null => {
    switch (status) {
      case 'pending': return 'preparing';
      case 'preparing': return 'ready';
      case 'ready': return 'completed';
      default: return null;
    }
  };
  
  // Previous available statuses for reverting
  const getPreviousStatus = (status: OrderStatus): OrderStatus | null => {
    switch (status) {
      case 'preparing': return 'pending';
      case 'ready': return 'preparing';
      case 'completed': return 'ready';
      default: return null;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 mt-1">View and manage customer orders</p>
        </div>
      </div>
      
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="sm:w-64">
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Orders' },
              { value: 'pending', label: 'Pending' },
              { value: 'preparing', label: 'Preparing' },
              { value: 'ready', label: 'Ready' },
              { value: 'completed', label: 'Completed' },
              { value: 'cancelled', label: 'Cancelled' },
            ]}
            fullWidth
          />
        </div>
        
        <div className="flex-1">
          <Input
            placeholder="Search orders by ID or table number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            fullWidth
          />
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          {isLoading ? (
            <Skeleton className="w-40 h-5" />
          ) : (
            <span>Showing {filteredOrders.length} of {orders.length} orders</span>
          )}
        </div>
      </div>
      
      {/* Order List */}
      {isLoading ? (
        <div className="space-y-4">
          {Array(5).fill(0).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="w-full h-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          title="No orders found"
          description={
            searchTerm 
              ? "No orders match your search criteria. Try different keywords." 
              : statusFilter !== 'all' 
                ? `No orders with ${statusFilter} status.`
                : "No orders found. Orders will appear here when customers place them."
          }
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          }
          action={
            searchTerm || statusFilter !== 'all' 
              ? {
                  label: 'Clear Filters',
                  onClick: () => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  },
                }
              : undefined
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <Card key={order.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 md:mb-0">
                    <div className="flex items-center">
                      <span className="font-bold text-gray-900 mr-2">{order.id}</span>
                      <Badge variant={getStatusVariant(order.status)}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-500">
                      Table {order.tableNumber} • {formatTime(order.timestamp)} • {formatDate(order.timestamp)}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {order.status !== 'cancelled' && order.status !== 'completed' && (
                      <>
                        {getNextStatus(order.status) && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleUpdateStatus(order.id, getNextStatus(order.status)!)}
                          >
                            {order.status === 'pending' ? 'Start Preparing' : 
                             order.status === 'preparing' ? 'Mark Ready' :
                             order.status === 'ready' ? 'Complete Order' : ''}
                          </Button>
                        )}
                        
                        {getPreviousStatus(order.status) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUpdateStatus(order.id, getPreviousStatus(order.status)!)}
                          >
                            Move Back
                          </Button>
                        )}
                        
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleUpdateStatus(order.id, 'cancelled')}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setIsOrderDetailsOpen(true);
                      }}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
                
                <div className="sm:flex items-start justify-between">
                  <div className="mb-3 sm:mb-0">
                    <div className="text-sm text-gray-600 mb-2">Order Items:</div>
                    <ul className="space-y-1">
                      {order.items.slice(0, 3).map((item, index) => (
                        <li key={index} className="text-sm">
                          <span className="font-medium">{item.quantity}x</span> {item.name}
                        </li>
                      ))}
                      {order.items.length > 3 && (
                        <li className="text-sm text-gray-500">
                          + {order.items.length - 3} more items
                        </li>
                      )}
                    </ul>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">Total Amount:</div>
                    <div className="font-bold text-lg">${order.totalAmount.toFixed(2)}</div>
                    <div className="text-sm text-gray-500">{order.paymentMethod}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      
      {/* Order Details Modal */}
      {isOrderDetailsOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-white p-4 border-b flex items-center justify-between">
              <h2 className="text-lg font-bold">Order Details: {selectedOrder.id}</h2>
              <button
                onClick={() => {
                  setIsOrderDetailsOpen(false);
                  setSelectedOrder(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex flex-wrap gap-4 justify-between">
                <div>
                  <div className="text-sm text-gray-500">Table</div>
                  <div className="font-medium">Table {selectedOrder.tableNumber}</div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Date & Time</div>
                  <div className="font-medium">
                    {formatDate(selectedOrder.timestamp)} at {formatTime(selectedOrder.timestamp)}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Status</div>
                  <Badge variant={getStatusVariant(selectedOrder.status)}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </Badge>
                </div>
                
                <div>
                  <div className="text-sm text-gray-500">Payment Method</div>
                  <div className="font-medium">{selectedOrder.paymentMethod}</div>
                </div>
              </div>
              
              <div className="border-t pt-4">
                <h3 className="font-medium text-gray-900 mb-3">Order Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start py-2 border-b last:border-0">
                      <div>
                        <div className="font-medium">{item.quantity}x {item.name}</div>
                        
                        {item.options && item.options.length > 0 && (
                          <ul className="text-sm text-gray-600 ml-6 mt-1">
                            {item.options.map((option, i) => (
                              <li key={i}>+ {option.name} (${option.price.toFixed(2)})</li>
                            ))}
                          </ul>
                        )}
                        
                        {item.specialInstructions && (
                          <div className="text-sm text-gray-600 italic ml-6 mt-1">
                            "{item.specialInstructions}"
                          </div>
                        )}
                      </div>
                      
                      <div className="text-right">
                        <div>${(item.price * item.quantity).toFixed(2)}</div>
                        {item.options && (
                          <div className="text-sm text-gray-600">
                            ${item.options.reduce((sum, opt) => sum + opt.price, 0).toFixed(2)} in options
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              {selectedOrder.specialRequests && (
                <div className="border-t pt-4">
                  <h3 className="font-medium text-gray-900 mb-2">Special Requests</h3>
                  <div className="bg-gray-50 p-3 rounded">
                    {selectedOrder.specialRequests}
                  </div>
                </div>
              )}
              
              <div className="border-t pt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${(selectedOrder.totalAmount * 0.93).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Tax (7%)</span>
                  <span>${(selectedOrder.totalAmount * 0.07).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span>Total</span>
                  <span>${selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="border-t p-4 bg-gray-50 flex flex-wrap justify-end gap-2">
              {selectedOrder.status !== 'cancelled' && selectedOrder.status !== 'completed' && (
                <>
                  {getNextStatus(selectedOrder.status) && (
                    <Button
                      variant="primary"
                      onClick={() => handleUpdateStatus(selectedOrder.id, getNextStatus(selectedOrder.status)!)}
                    >
                      {selectedOrder.status === 'pending' ? 'Start Preparing' : 
                       selectedOrder.status === 'preparing' ? 'Mark Ready' :
                       selectedOrder.status === 'ready' ? 'Complete Order' : ''}
                    </Button>
                  )}
                  
                  {selectedOrder.status !== 'pending' && (
                    <Button
                      variant="outline"
                      onClick={() => handleUpdateStatus(selectedOrder.id, getPreviousStatus(selectedOrder.status)!)}
                    >
                      Move Back
                    </Button>
                  )}
                  
                  <Button
                    variant="danger"
                    onClick={() => handleUpdateStatus(selectedOrder.id, 'cancelled')}
                  >
                    Cancel Order
                  </Button>
                </>
              )}
              
              <Button
                variant="ghost"
                onClick={() => {
                  setIsOrderDetailsOpen(false);
                  setSelectedOrder(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Sample data for the Orders page
const sampleOrders: Order[] = [
  {
    id: 'ORD-1234',
    tableNumber: 3,
    status: 'completed',
    items: [
      { id: 1, name: 'Classic Cheeseburger', price: 12.99, quantity: 1 },
      { id: 2, name: 'French Fries', price: 4.99, quantity: 1 },
      { id: 3, name: 'Chocolate Milkshake', price: 5.99, quantity: 1, specialInstructions: 'Extra whipped cream' },
    ],
    totalAmount: 23.97,
    timestamp: new Date(Date.now() - 60 * 60000), // 1 hour ago
    paymentMethod: 'Credit Card',
  },
  {
    id: 'ORD-1235',
    tableNumber: 5,
    status: 'preparing',
    items: [
      { id: 4, name: 'Margherita Pizza', price: 14.99, quantity: 1, options: [{ name: 'Extra Cheese', price: 1.50 }] },
      { id: 5, name: 'Garlic Bread', price: 3.99, quantity: 1 },
      { id: 6, name: 'Soda', price: 2.49, quantity: 2 },
    ],
    totalAmount: 25.46,
    timestamp: new Date(Date.now() - 15 * 60000), // 15 minutes ago
    paymentMethod: 'Cash',
    specialRequests: 'Please bring extra napkins',
  },
  {
    id: 'ORD-1236',
    tableNumber: 2,
    status: 'ready',
    items: [
      { id: 7, name: 'Steak', price: 24.99, quantity: 1, options: [{ name: 'Medium Rare', price: 0 }] },
      { id: 8, name: 'Caesar Salad', price: 9.99, quantity: 1 },
      { id: 9, name: 'Red Wine', price: 7.99, quantity: 1 },
    ],
    totalAmount: 42.97,
    timestamp: new Date(Date.now() - 5 * 60000), // 5 minutes ago
    paymentMethod: 'Credit Card',
  },
  {
    id: 'ORD-1237',
    tableNumber: 1,
    status: 'pending',
    items: [
      { id: 10, name: 'Buffalo Wings', price: 10.99, quantity: 1 },
      { id: 11, name: 'Onion Rings', price: 5.99, quantity: 1 },
      { id: 12, name: 'Soda', price: 2.49, quantity: 2 },
    ],
    totalAmount: 21.96,
    timestamp: new Date(), // Just now
    paymentMethod: 'Cash',
  },
  {
    id: 'ORD-1238',
    tableNumber: 7,
    status: 'cancelled',
    items: [
      { id: 13, name: 'Caesar Salad', price: 9.99, quantity: 1 },
    ],
    totalAmount: 9.99,
    timestamp: new Date(Date.now() - 25 * 60000), // 25 minutes ago
    paymentMethod: 'Credit Card',
  },
  {
    id: 'ORD-1239',
    tableNumber: 4,
    status: 'completed',
    items: [
      { id: 14, name: 'Vegetarian Pizza', price: 13.99, quantity: 1 },
      { id: 15, name: 'Green Salad', price: 7.99, quantity: 1 },
      { id: 16, name: 'Iced Tea', price: 2.99, quantity: 2 },
    ],
    totalAmount: 27.96,
    timestamp: new Date(Date.now() - 90 * 60000), // 1.5 hours ago
    paymentMethod: 'Mobile Payment',
  },
  {
    id: 'ORD-1240',
    tableNumber: 6,
    status: 'pending',
    items: [
      { id: 17, name: 'Pasta Carbonara', price: 14.99, quantity: 1 },
      { id: 18, name: 'Garlic Bread', price: 3.99, quantity: 1 },
      { id: 19, name: 'Tiramisu', price: 6.99, quantity: 1 },
    ],
    totalAmount: 25.97,
    timestamp: new Date(Date.now() - 2 * 60000), // 2 minutes ago
    paymentMethod: 'Credit Card',
  },
];