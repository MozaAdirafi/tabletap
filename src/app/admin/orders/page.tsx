"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import {
  Order,
  getOrders,
  updateOrderStatus,
  deleteOrder,
  subscribeToOrderUpdates,
} from "@/lib/utils/store";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Order["status"] | "all">("all");

  useEffect(() => {
    // Load initial orders
    setOrders(getOrders());

    // Subscribe to order updates
    const unsubscribe = subscribeToOrderUpdates((updatedOrder) => {
      setOrders((prevOrders) => {
        const orderIndex = prevOrders.findIndex((o) => o.id === updatedOrder.id);
        if (orderIndex >= 0) {
          const newOrders = [...prevOrders];
          newOrders[orderIndex] = updatedOrder;
          return newOrders;
        }
        return [...prevOrders, updatedOrder];
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleStatusChange = (orderId: number, newStatus: Order["status"]) => {
    updateOrderStatus(orderId, newStatus);
  };

  const handleDeleteOrder = (orderId: number) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      deleteOrder(orderId);
      setOrders((prevOrders) => prevOrders.filter((o) => o.id !== orderId));
    }
  };

  const filteredOrders = orders
    .filter((order) =>
      statusFilter === "all" ? true : order.status === statusFilter
    )
    .filter((order) =>
      searchQuery
        ? order.id.toString().includes(searchQuery) ||
          order.tableId.toLowerCase().includes(searchQuery.toLowerCase())
        : true
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  const getStatusBadgeColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "preparing":
        return "bg-blue-100 text-blue-800";
      case "ready":
        return "bg-green-100 text-green-800";
      case "delivered":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-4">Orders</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Search by order # or table..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as Order["status"] | "all")}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <Card className="p-6 text-center text-gray-500">
            No orders found
          </Card>
        ) : (
          filteredOrders.map((order) => (
            <Card key={order.id} className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-semibold mb-1">
                    Order #{order.id}
                  </h3>
                  <p className="text-gray-600">Table {order.tableId}</p>
                  <p className="text-sm text-gray-500">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>
                <Badge className={getStatusBadgeColor(order.status)}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </Badge>
              </div>

              <div className="border-t border-b py-4 mb-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-start mb-2 last:mb-0"
                  >
                    <div>
                      <p className="font-medium">{item.menuItem.name}</p>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium">
                      ${(item.menuItem.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center">
                <div className="space-x-2">
                  {order.status !== "cancelled" && order.status !== "delivered" && (
                    <>
                      {order.status === "pending" && (
                        <Button
                          variant="primary"
                          onClick={() =>
                            handleStatusChange(order.id, "preparing")
                          }
                        >
                          Start Preparing
                        </Button>
                      )}
                      {order.status === "preparing" && (
                        <Button
                          variant="primary"
                          onClick={() => handleStatusChange(order.id, "ready")}
                        >
                          Mark as Ready
                        </Button>
                      )}
                      {order.status === "ready" && (
                        <Button
                          variant="primary"
                          onClick={() =>
                            handleStatusChange(order.id, "delivered")
                          }
                        >
                          Mark as Delivered
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        onClick={() =>
                          handleStatusChange(order.id, "cancelled")
                        }
                      >
                        Cancel Order
                      </Button>
                    </>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    ${order.totalAmount.toFixed(2)}
                  </p>
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-800"
                    onClick={() => handleDeleteOrder(order.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}