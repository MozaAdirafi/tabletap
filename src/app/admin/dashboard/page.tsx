// src/app/admin/dashboard/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import Link from "next/link";
import { useAuth } from "@/lib/context/AuthContext";
import { useRouter } from "next/navigation";
import { getTablesFromDB, subscribeToOrders } from "@/lib/firebase/firestore";
import { Order } from "@/lib/utils/store";
import { QRCodeSVG } from "qrcode.react";
import { jsPDF } from "jspdf";
// Import the autotable plugin separately for proper compatibility with jsPDF v3.0
import autoTable from "jspdf-autotable";

// Define a type for the jsPDF instance extended with autotable's properties
interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable: {
    finalY: number;
  };
}

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
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  timestamp: Date;
}

interface PopularItem {
  id: string;
  name: string;
  category: string;
  orders: number;
  rating?: number;
  ratingCount?: number;
  price: string;
}

interface TableData {
  id: string;
  number: number;
}

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [todaysOrders, setTodaysOrders] = useState<Order[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [popularItems, setPopularItems] = useState<PopularItem[]>([]);
  const [tables, setTables] = useState<TableData[]>([]);
  const [activeTables, setActiveTables] = useState<number>(0);
  const [totalRevenue, setTotalRevenue] = useState<number>(0);
  const [averageOrderValue, setAverageOrderValue] = useState<number>(0);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  // Export dashboard data to PDF
  const exportToPDF = () => {
    if (isExporting || !user) return;

    setIsExporting(true);

    try {
      // Create a new PDF document
      const doc = new jsPDF();
      const today = new Date().toLocaleDateString();

      // Add title
      doc.setFontSize(20);
      doc.text("Restaurant Dashboard Report", 105, 15, { align: "center" });

      doc.setFontSize(12);
      doc.text(`Generated on: ${today}`, 105, 22, { align: "center" });
      doc.text(`Restaurant ID: ${user.uid}`, 105, 28, { align: "center" });

      // Add stats
      doc.setFontSize(16);
      doc.text("Key Stats", 14, 40);

      doc.setFontSize(12);
      doc.text(`Today's Orders: ${todaysOrders.length}`, 14, 50);
      doc.text(`Total Revenue: $${totalRevenue.toFixed(2)}`, 14, 57);
      doc.text(`Average Order Value: $${averageOrderValue.toFixed(2)}`, 14, 64);
      doc.text(`Active Tables: ${activeTables}`, 14, 71);

      // Add recent orders table
      doc.setFontSize(16);
      doc.text("Recent Orders", 14, 85);

      let finalY = 95;

      if (recentOrders.length > 0) {
        // Use autoTable as an imported function
        autoTable(doc, {
          startY: 90,
          head: [["Order ID", "Table", "Status", "Items", "Total"]],
          body: recentOrders.map((order) => [
            order.id,
            order.tableNumber.toString(),
            order.status.charAt(0).toUpperCase() + order.status.slice(1),
            order.items
              .reduce((sum, item) => sum + item.quantity, 0)
              .toString(),
            `$${order.totalAmount.toFixed(2)}`,
          ]),
        });

        // Get the position after the table        finalY = (doc as JsPDFWithAutoTable).lastAutoTable.finalY;
      } else {
        doc.text("No recent orders", 14, 95);
      }

      // Add popular items
      doc.setFontSize(16);
      doc.text("Popular Items", 14, finalY + 15);

      if (popularItems.length > 0) {
        autoTable(doc, {
          startY: finalY + 20,
          head: [["Item Name", "Category", "Orders", "Price"]],
          body: popularItems.map((item) => [
            item.name,
            item.category,
            item.orders.toString(),
            item.price,
          ]),
        });

        // Get the position after the table
        finalY = (doc as JsPDFWithAutoTable).lastAutoTable.finalY;
      } else {
        doc.text("No popular items data available", 14, finalY + 25);
        finalY += 25;
      }

      // Add tables information
      doc.setFontSize(16);
      doc.text("Tables", 14, finalY + 15);

      if (tables.length > 0) {
        autoTable(doc, {
          startY: finalY + 20,
          head: [["Table Number", "Table ID"]],
          body: tables.map((table) => [table.number.toString(), table.id]),
        });
      } else {
        doc.text("No tables data available", 14, finalY + 25);
      }

      // Save the PDF
      doc.save(`restaurant-dashboard-${today}.pdf`);
    } catch (error) {
      console.error("Error exporting to PDF:", error);
      alert("Failed to export data to PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Load data from Firestore
  useEffect(() => {
    if (!user) return;

    const restaurantId = user.uid;
    setIsLoading(true);

    const loadData = async () => {
      try {
        // Get all tables
        const tableData = await getTablesFromDB(restaurantId);
        setTables(tableData);

        // Subscribe to orders (real-time updates)
        const unsubscribe = subscribeToOrders(restaurantId, (orders) => {
          setAllOrders(orders);
          processOrderData(orders, tableData);
          setIsLoading(false);
        });

        return unsubscribe;
      } catch (error) {
        console.error("Error loading dashboard data:", error);
        setIsLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Process order data to calculate metrics
  const processOrderData = (allOrders: Order[], tableData: TableData[]) => {
    if (!allOrders || allOrders.length === 0) return;

    // Filter for today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todaysOrdersList = allOrders.filter((order) => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= today;
    });

    setTodaysOrders(todaysOrdersList);

    // Calculate total revenue from today's orders
    const revenue = todaysOrdersList.reduce(
      (sum, order) => sum + order.totalAmount,
      0
    );
    setTotalRevenue(revenue);

    // Calculate average order value
    const avg = revenue / (todaysOrdersList.length || 1);
    setAverageOrderValue(avg);

    // Count active tables (tables with orders that are not delivered or cancelled)
    const activeTableIds = new Set<string>();
    allOrders.forEach((order) => {
      if (order.status !== "delivered" && order.status !== "cancelled") {
        activeTableIds.add(order.tableId);
      }
    });
    setActiveTables(activeTableIds.size);

    // Format recent orders
    const recent = allOrders.slice(0, 3).map((order) => {
      const tableNumber =
        tableData.find((t) => t.id === order.tableId)?.number || 0;

      return {
        id: order.id.toString(),
        tableNumber,
        status: order.status as
          | "pending"
          | "preparing"
          | "ready"
          | "delivered"
          | "cancelled",
        items: order.items.map((item) => ({
          name: item.menuItem.name,
          quantity: item.quantity,
          price: item.menuItem.price,
        })),
        totalAmount: order.totalAmount,
        timestamp: order.createdAt,
      };
    });

    setRecentOrders(recent);

    // Calculate popular items
    const itemMap = new Map<
      string,
      { count: number; name: string; price: number; category: string }
    >();

    allOrders.forEach((order) => {
      order.items.forEach(({ menuItem, quantity }) => {
        const current = itemMap.get(menuItem.id) || {
          count: 0,
          name: menuItem.name,
          price: menuItem.price,
          category: menuItem.categoryId,
        };

        current.count += quantity;
        itemMap.set(menuItem.id, current);
      });
    });

    const popular = Array.from(itemMap.entries())
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([id, data]) => ({
        id,
        name: data.name,
        orders: data.count,
        price: `$${data.price.toFixed(2)}`,
        category: data.category,
      }));

    setPopularItems(popular);
  };

  // Create stats data for the cards
  const statsData: StatCardProps[] = [
    {
      title: "Today's Orders",
      value: todaysOrders.length,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>
      ),
      color: "bg-blue-50 text-blue-700",
    },
    {
      title: "Total Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "bg-green-50 text-green-700",
    },
    {
      title: "Avg. Order Value",
      value: `$${averageOrderValue.toFixed(2)}`,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
      color: "bg-yellow-50 text-yellow-700",
    },
    {
      title: "Active Tables",
      value: activeTables,
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      ),
      color: "bg-purple-50 text-purple-700",
    },
  ];

  // Helper function to format the timestamp
  function formatTime(date: Date) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  // Helper function to get status badge variant
  function getStatusVariant(status: string) {
    switch (status) {
      case "pending":
        return "warning";
      case "preparing":
        return "primary";
      case "ready":
        return "secondary";
      case "delivered":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "default";
    }
  }

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/auth/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <div className="space-y-8">
      {" "}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Overview of your restaurant&apos;s performance
          </p>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportToPDF}
            disabled={isExporting}
          >
            {isExporting ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="animate-spin h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            )}
            {isExporting ? "Exporting..." : "Export"}
          </Button>{" "}
          <Link href="/admin/settings">
            {" "}
            <Button variant="outline" size="sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              Settings
            </Button>
          </Link>
          <Link href="/customer/scan" target="_blank">
            <Button variant="secondary" size="sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
              Customer Mode
            </Button>
          </Link>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Logout
          </Button>
          <Link href="/admin/orders">
            <Button variant="primary" size="sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Manage Orders
            </Button>
          </Link>
        </div>
      </div>
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading
          ? Array(4)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="h-full">
                  <CardContent className="p-6">
                    <Skeleton className="w-24 h-4 mb-3" />
                    <Skeleton className="w-16 h-8 mb-3" />
                    <Skeleton className="w-20 h-3" />
                  </CardContent>
                </Card>
              ))
          : statsData.map((stat, index) => (
              <Card key={index} className="h-full">
                <CardContent className={`p-6 ${stat.color}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium mb-1 opacity-90">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold">{stat.value}</p>

                      {stat.trend && (
                        <p
                          className={`text-xs font-medium flex items-center mt-1 ${
                            stat.trend.isPositive
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          <span className="mr-1">
                            {stat.trend.isPositive ? (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            ) : (
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3 w-3"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            )}
                          </span>
                          {stat.trend.value}% since yesterday
                        </p>
                      )}
                    </div>
                    <div className="opacity-80">{stat.icon}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
      </div>
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="border-b flex items-center justify-between">
              <h2 className="text-lg font-semibold">Recent Orders</h2>
              <Link href="/admin/orders">
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <div className="p-1">
              {isLoading ? (
                Array(3)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="p-4 border-b last:border-0">
                      <Skeleton className="w-full h-20" />
                    </div>
                  ))
              ) : recentOrders.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No orders yet. Orders will appear here when customers place
                  them.
                </div>
              ) : (
                recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 border-b last:border-0 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <span className="font-semibold text-gray-900">
                          {order.id}
                        </span>
                        <Badge
                          variant={getStatusVariant(order.status)}
                          className="ml-2"
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </Badge>
                      </div>
                      <span className="text-sm text-gray-500">
                        {formatTime(order.timestamp)}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      <span className="font-medium">
                        Table {order.tableNumber}
                      </span>{" "}
                      •
                      <span className="ml-1">
                        {order.items.reduce(
                          (sum, item) => sum + item.quantity,
                          0
                        )}{" "}
                        items
                      </span>{" "}
                      •
                      <span className="ml-1">
                        ${order.totalAmount.toFixed(2)}
                      </span>
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
                <Button variant="ghost" size="sm">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <div className="p-1">
              {isLoading ? (
                Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <div key={i} className="p-4 border-b last:border-0">
                      <Skeleton className="w-full h-12" />
                    </div>
                  ))
              ) : popularItems.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No data yet. Popular items will appear here when customers
                  place orders.
                </div>
              ) : (
                popularItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-4 border-b last:border-0 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {item.name}
                        </h3>
                        <div className="flex items-center text-sm mt-1">
                          <span className="text-gray-500 mr-2">
                            {item.category}
                          </span>
                          {item.rating && (
                            <div className="flex items-center text-yellow-400">
                              <span>{item.rating}</span>
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4 ml-1"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="text-gray-500 text-xs ml-1">
                                ({item.ratingCount || 0})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-medium text-gray-900">
                          {item.price}
                        </span>
                        <div className="text-sm text-gray-500 mt-1">
                          {item.orders} orders
                        </div>
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
            <Button variant="primary" size="sm">
              Manage QR Codes
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {isLoading ? (
            Array(5)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="h-40">
                  <CardContent className="p-4 flex flex-col items-center justify-center">
                    <Skeleton className="w-20 h-20 mb-2" />
                    <Skeleton className="w-16 h-4" />
                  </CardContent>
                </Card>
              ))
          ) : tables.length === 0 ? (
            <div className="col-span-full p-6 text-center text-gray-500">
              No tables added yet. Add tables in the QR Code Management section.
            </div>
          ) : (
            tables.slice(0, 5).map((table) => (
              <Card
                key={table.id}
                className="hover:shadow-md transition-shadow"
              >
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <div className="mb-2 w-20 h-20">
                    <QRCodeSVG
                      id={`dashboard-qr-${table.id}`}
                      value={`${
                        typeof window !== "undefined"
                          ? window.location.origin
                          : ""
                      }/customer/scan?table=${table.number}&restaurant=${
                        user?.uid
                      }`}
                      size={80}
                      level="M"
                      includeMargin={true}
                    />
                  </div>
                  <span className="text-sm font-medium">
                    Table {table.number}
                  </span>
                </CardContent>
              </Card>
            ))
          )}
          {!isLoading && tables.length > 0 && tables.length > 5 && (
            <Card className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex flex-col items-center justify-center">
                <div className="w-20 h-20 bg-gray-100 flex items-center justify-center mb-2 text-gray-500">
                  +{tables.length - 5} more
                </div>
                <span className="text-sm font-medium text-gray-500">
                  View All
                </span>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
