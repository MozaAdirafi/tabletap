"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Order, getOrderById } from "@/lib/utils/store";

export default function ConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const restaurantId = searchParams.get("restaurant");
  const tableId = searchParams.get("table");

  useEffect(() => {
    const fetchOrder = async () => {
      const orderId = searchParams.get("orderId");
      if (!orderId || !restaurantId || !tableId) {
        router.push("/customer/scan");
        return;
      }      try {
        const orderData = await getOrderById(restaurantId, parseInt(orderId));
        if (!orderData) {
          router.push("/customer/scan");
          return;
        }

        setOrder(orderData);
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [router, searchParams, restaurantId, tableId]);

  const getStatusColor = (status: Order["status"]) => {
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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">Loading order details...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-semibold mb-4">Order Not Found</h2>
            <p className="text-gray-600 mb-4">
              We could not find your order. Please try again or contact staff for assistance.
            </p>
            <Button
              variant="outline"
              onClick={() => router.push(`/customer/menu?restaurant=${restaurantId}&table=${tableId}`)}
            >
              Return to Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardContent className="p-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Thank you for your order!</h2>
            <p className="text-gray-600">Order #{order.id}</p>
            <div className="mt-4">
              <Badge
                className={`text-lg px-4 py-2 ${getStatusColor(order.status)}`}
              >
                {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Unknown'}
              </Badge>
            </div>
          </div>

          <div className="border-t border-b py-6 mb-6">
            <h3 className="font-semibold mb-4">Order Details</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{item.menuItem.name}</p>
                    <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                  </div>
                  <p className="font-medium">
                    ${(item.menuItem.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Table</span>
              <span>{order.tableId}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Total Amount</span>
              <span className="font-bold">${order.totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Order Time</span>
              <span>
                {new Date(order.createdAt).toLocaleTimeString()}
              </span>
            </div>
          </div>

          <div className="mt-6 flex gap-4 justify-end">
            <Button
              variant="outline"
              onClick={() => router.push(`/customer/track-order?orderId=${order.id}&restaurant=${restaurantId}&table=${tableId}`)}
            >
              Track Order Status
            </Button>
            <Button 
              variant="primary" 
              onClick={() => router.push(`/customer/menu?restaurant=${restaurantId}&table=${tableId}`)}
            >
              Place Another Order
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
