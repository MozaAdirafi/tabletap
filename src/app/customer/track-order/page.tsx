"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Order, getOrderById } from "@/lib/utils/store";
import { OrderStatusAlert } from "@/components/ui/OrderStatusAlert";
import { subscribeToOrders } from "@/lib/firebase/firestore";

export default function TrackOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const restaurantId = searchParams.get("restaurant");
  const tableId = searchParams.get("table");
  useEffect(() => {
    const orderId = searchParams.get("orderId");
    if (!orderId || !restaurantId || !tableId) {
      router.push("/customer/scan");
      return;
    } // Subscribe to order updates in real-time
    const unsubscribe = subscribeToOrders(restaurantId, (orders) => {
      // Find the matching order from the orders array
      const matchingOrder = orders.find((o) => o.id === parseInt(orderId));
      if (matchingOrder) {
        setOrder(matchingOrder);
      }
    });

    return () => {
      unsubscribe();
    };
  }, [router, searchParams, restaurantId, tableId]);
  if (!order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Order not found</h2>
            <p className="text-gray-600 mb-4">
              We could not find your order. Please try again or contact staff
              for assistance.
            </p>
            <Button
              variant="primary"
              onClick={() =>
                router.push(
                  `/customer/menu?restaurant=${restaurantId}&table=${tableId}`
                )
              }
            >
              Return to Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (order.status === "cancelled") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">Order Cancelled</h2>
              <p className="text-gray-600">Order #{order.id}</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <p className="text-red-800 text-center">
                This order has been cancelled. Please contact staff if you have
                any questions.
              </p>
            </div>
            <div className="text-center">
              <Button
                variant="primary"
                onClick={() =>
                  router.push(
                    `/customer/menu?restaurant=${restaurantId}&table=${tableId}`
                  )
                }
              >
                Place New Order
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const steps = [
    { status: "pending", label: "Order Placed" },
    { status: "preparing", label: "Preparing" },
    { status: "ready", label: "Ready for Pickup" },
    { status: "delivered", label: "Delivered" },
  ];

  const currentStepIndex = steps.findIndex(
    (step) => step.status === order.status
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardContent className="p-6">
          {" "}
          <div className="text-center mb-4">
            <h2 className="text-2xl font-bold mb-2">Track Your Order</h2>
            <p className="text-gray-600">Order #{order.id}</p>
          </div>
          {/* Status Alert */}
          <div className="mb-6">
            <OrderStatusAlert status={order.status} />
          </div>
          {/* Share/Save Button */}
          <div className="mb-8 flex justify-center space-x-4">
            {" "}
            <Button
              variant="secondary"
              onClick={() => {
                const url = window.location.href;
                navigator.clipboard.writeText(url);
                alert("Tracking link copied to clipboard!");
              }}
            >
              Copy Tracking Link
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                const url = window.location.href;
                if (navigator.share) {
                  navigator.share({
                    title: `Order #${order.id} Status`,
                    text: "Track your order status",
                    url: url,
                  });
                } else {
                  window.open(
                    `https://wa.me/?text=Track my order: ${url}`,
                    "_blank"
                  );
                }
              }}
            >
              Share Link
            </Button>
          </div>
          {/* Progress Timeline */}
          <div className="mb-8">
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gray-200" />

              {/* Progress Steps */}
              <div className="relative space-y-8">
                {steps.map((step, index) => {
                  const isCompleted = index <= currentStepIndex;
                  const isCurrent = index === currentStepIndex;

                  return (
                    <div
                      key={step.status}
                      className={`flex items-center ${
                        index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                      }`}
                    >
                      <div className="w-1/2 px-4 text-right">
                        <h3
                          className={`font-medium ${
                            isCompleted ? "text-primary-600" : "text-gray-500"
                          }`}
                        >
                          {step.label}
                        </h3>
                        {isCurrent && (
                          <p className="text-sm text-gray-500">
                            Current Status
                          </p>
                        )}
                      </div>
                      <div className="relative flex items-center justify-center w-8">
                        <div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                            isCompleted
                              ? "border-primary-600 bg-primary-600"
                              : "border-gray-300 bg-white"
                          }`}
                        >
                          {isCompleted && (
                            <svg
                              className="w-5 h-5 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="w-1/2 px-4" />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Order Details */}
          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Order Details</h3>
            <div className="space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-start">
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

            <div className="mt-6 pt-6 border-t">
              <div className="flex justify-between mb-2">
                <span className="font-medium">Table</span>
                <span>{order.tableId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total Amount</span>
                <span className="font-bold">
                  ${order.totalAmount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>{" "}
          <div className="mt-6 flex justify-end">
            <Button
              variant="primary"
              onClick={() =>
                router.push(
                  `/customer/menu?restaurant=${restaurantId}&table=${tableId}`
                )
              }
            >
              Return to Menu
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
