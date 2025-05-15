// src/app/admin/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';

// Define types for the dashboard data
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

interface RecentOrder {
  id: string;
  tableNumber: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  timestamp: Date;
}

interface PopularItem {
  id: number;
  name: string;
  category: string;
  orders: number;
  rating: number;
  ratingCount: number;
  price: string;
}

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  
  // In a real app, this would come from an API
  const statsData: StatCardProps[] = [
    {
      title: "Today's Orders",
      value: 24,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      color: "bg-blue-50 text-blue-700",
      trend: {
        value: 12,
        isPositive: true
      }
    },
    {
      title: "Total Revenue",
      value: "$584.25",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-green-50 text-green-700",
      trend: {
        value: 8.5,
        isPositive: true
      }
    },
    {
      title: "Avg. Order Time",
      value: "18 min",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "bg-yellow-50 text-yellow-700",
      trend: {
        value: 5,
        isPositive: false
      }
    },
    {
      title: "Active Tables",
      value: 8,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      color: "bg-purple-50 text-purple-700"
    }
  ];
  
  const recentOrders: RecentOrder[] = [
    {
      id: "ORD-1234",
      tableNumber: 3,
      status: "completed",
      items: [
        { name: "Classic Cheeseburger", quantity: 1, price: 12.99 },
        { name: "French Fries", quantity: 1, price: 4.99 },
        { name: "Chocolate Milkshake", quantity: 1, price: 5.99 }
      ],
      totalAmount: 23.97,
      timestamp: new Date(Date.now() - 30 * 60000) // 30 minutes ago
    },
    {
      id: "ORD-1235",
      tableNumber: 5,
      status: "preparing",
      items: [
        { name: "Margherita Pizza", quantity: 1, price: 14.99 },
        { name: "Garlic Bread", quantity: 1, price: 3.99 },
        { name: "Soda", quantity: 2, price: 2.49 }
      ],
      totalAmount: 23.96,
      timestamp: new Date(Date.now() - 15 * 60000) // 15 minutes ago
    },
    {
      id: "ORD-1236",
      tableNumber: 2,
      status: "ready",
      items: [
        { name: "Steak", quantity: 1, price: 24.99 },
        { name: "Caesar Salad", quantity: 1, price: 9.99 },
        { name: "Red Wine", quantity: 1, price: 7.99 }
      ],
      totalAmount: 42.97,
      timestamp: new Date(Date.now() - 5 * 60000) // 5 minutes ago
    }
  ];
  
  const popularItems: PopularItem[] = [
    { id: 1, name: "Classic Cheeseburger", category: "Main Course", orders: 124, rating: 4.8, ratingCount: 237, price: "$12.99" },
    { id: 2, name: "Margherita Pizza", category: "Main Course", orders: 98, rating: 4.7, ratingCount: 185, price: "$14.99" },
    { id: 3, name: "Caesar Salad", category: "Appetizer", orders: 87, rating: 4.5, ratingCount: 142, price: "$9.99" },
    { id: 4, name: "Chocolate Brownie", category: "Dessert", orders: 76, rating: 4.9, ratingCount: 158, price: "$6.99" },
    { id: 5, name: "French Fries", category: "Side", orders: 203, rating: 4.6, ratingCount: 276, price: "$4.99" }
  ];
  
  // Simulate API call
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  
  // Helper function to format the timestamp
  function formatTime(date: Date) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  
  // Helper function to get status badge variant
  function getStatusVariant(status: string) {
    switch (status) {
      case 'pending': return 'warning';
      case 'preparing': return 'primary';
      case 'ready': return 'secondary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'default';
    }
  }
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of your restaurants performance</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Export
          </Button>
          <Button variant="primary" size="sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            New Order
          </Button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} className="h-full">
              <CardContent className="p-6">
                <Skeleton className="w-24 h-4 mb-3" />
                <Skeleton className="w-16 h-8 mb-3" />
                <Skeleton className="w-20 h-3" />
              </CardContent>
            </Card>
          ))
        ) : (
          statsData.map((stat, index) => (
            <Card key={index} className="h-full">
              <CardContent className={`p-6 ${stat.color}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium mb-1 opacity-90">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    
                    {stat.trend && (
                      <p className={`text-xs font-medium flex items-center mt-1 ${
                        stat.trend.isPositive ? "text-green-600" : "text-red-600"
                      }`}>
                        <span className="mr-1">
                          {stat.trend.isPositive ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z" clipRule="evenodd" />
                            </svg>
                          )}
                        </span>
                        {stat.trend.value}% since yesterday
                      </p>
                    )}
                  </div>
                  <div className="opacity-80">
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Orders</h2>
              <Link href="/admin/orders">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <div className="p-1">
              {isLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="p-4 border-b last:border-0">
                    <Skeleton className="w-full h-20" />
                  </div>
                ))
              ) : (
                recentOrders.map((order) => (
                  <div key={order.id} className="p-4 border-b last:border-0 hover:bg-gray-50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-900">{order.id}</span>
                        <Badge 
                          variant={getStatusVariant(order.status)} 
                          className="ml-2"
                        >
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">{formatTime(order.timestamp)}</span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">Table {order.tableNumber}</span> • 
                      <span className="ml-1">{order.items.reduce((sum, item) => sum + item.quantity, 0)} items</span> • 
                      <span className="ml-1">${order.totalAmount.toFixed(2)}</span>
                    </div>
                    
                    <div className="text-sm text-gray-500 line-clamp-1">
                      {order.items.map((item, i) => (
                        <span key={i}>
                          {i > 0 && ", "}
                          {item.quantity}x {item.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
        
        {/* Popular Items */}
        <div>
          <Card>
            <CardHeader className="border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Popular Items</h2>
              <Link href="/admin/menu-management">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <div className="p-1">
              {isLoading ? (
                Array(5).fill(0).map((_, i) => (
                  <div key={i} className="p-4 border-b last:border-0">
                    <Skeleton className="w-full h-12" />
                  </div>
                ))
              ) : (
                popularItems.map((item) => (
                  <div key={item.id} className="p-4 border-b last:border-0 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">{item.name}</h3>
                        <div className="flex items-center text-sm mt-1">
                          <span className="text-gray-500 mr-2">{item.category}</span>
                          <div className="flex items-center text-yellow-400">
                            <span>{item.rating}</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                            <span className="text-gray-500 text-xs ml-1">({item.ratingCount})</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-gray-900">{item.price}</span>
                        <div className="text-sm text-gray-500 mt-1">{item.orders} orders</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
      
      {/* QR Codes Preview */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Table QR Codes</h2>
          <Link href="/admin/qr-codes">
            <Button variant="primary" size="sm">Manage QR Codes</Button>
          </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {isLoading ? (
            Array(5).fill(0).map((_, i) => (
              <Card key={i} className="h-40">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <Skeleton className="w-20 h-20 mb-2" />
                  <Skeleton className="w-16 h-4" />
                </CardContent>
              </Card>
            ))
          ) : (
            Array(5).fill(0).map((_, i) => (
              <Card key={i} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="w-20 h-20 bg-gray-200 flex items-center justify-center mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium">Table {i + 1}</span>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}