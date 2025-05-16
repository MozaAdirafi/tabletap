"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Order, MenuItem, addOrder } from "@/lib/utils/store";

interface CartItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  selectedOptions?: string[];
  selectedSize?: string;
  specialInstructions?: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tipPercentage, setTipPercentage] = useState(15);
  const [specialRequests, setSpecialRequests] = useState("");
  const [tableId, setTableId] = useState<string | null>(null);

  useEffect(() => {
    // Get table ID from storage
    const storedTableId = localStorage.getItem("tableId");
    if (!storedTableId) {
      router.push("/customer/scan");
      return;
    }
    setTableId(storedTableId);

    // Load cart
    try {
      const savedCart = localStorage.getItem("cartItems");
      if (savedCart) {
        setCartItems(JSON.parse(savedCart));
      } else {
        const sessionCart = sessionStorage.getItem("cartItems");
        if (sessionCart) {
          setCartItems(JSON.parse(sessionCart));
          localStorage.setItem("cartItems", sessionCart);
        }
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    }
    setIsLoading(false);
  }, [router]);

  const subtotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.07;
  const tip = (subtotal * tipPercentage) / 100;
  const total = subtotal + tax + tip;

  const handlePlaceOrder = async () => {
    if (!tableId) {
      alert("No table selected. Please scan a QR code first.");
      router.push("/customer/scan");
      return;
    }

    try {
      // Create order object
      const orderItems = cartItems.map(item => ({
        menuItem: {
          id: item.id,
          name: item.name,
          price: item.price,
          description: "", // These fields are required by MenuItem but not needed for order
          available: true,
          tags: [],
          categoryId: "",
        } as MenuItem,
        quantity: item.quantity
      }));

      const order: Order = {
        id: 0, // Will be set by store
        tableId,
        items: orderItems,
        status: "pending",
        totalAmount: total,
        createdAt: new Date(),
      };

      // Add order to store
      addOrder(order);

      // Clear cart
      localStorage.removeItem("cartItems");
      sessionStorage.removeItem("cartItems");

      // Redirect to confirmation page with order ID
      router.push(`/customer/confirmation?orderId=${order.id}`);
    } catch (error) {
      console.error("Failed to place order:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  if (isLoading) {
    return <div className="max-w-4xl mx-auto px-4 py-8">Loading...</div>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-4">
              Add some items to your cart to check out
            </p>
            <Button
              variant="primary"
              onClick={() => router.push("/customer/menu")}
            >
              Return to Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <Button
          variant="outline"
          onClick={() => router.push("/customer/menu")}
          className="flex items-center gap-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
              clipRule="evenodd"
            />
          </svg>
          Back to Menu
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-4">Order Summary</h2>
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start justify-between pb-4 border-b"
                  >
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                      {item.selectedSize && (
                        <p className="text-sm text-gray-600">
                          Size: {item.selectedSize}
                        </p>
                      )}
                      {item.selectedOptions &&
                        item.selectedOptions.length > 0 && (
                          <p className="text-sm text-gray-600">
                            Options: {item.selectedOptions.join(", ")}
                          </p>
                        )}
                      {item.specialInstructions && (
                        <p className="text-sm text-gray-600">
                          Note: {item.specialInstructions}
                        </p>
                      )}
                    </div>
                    <p className="font-medium">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Special Requests */}
          <Card className="mt-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-4">Special Requests</h2>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="Any special requests for your order?"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </CardContent>
          </Card>
        </div>

        {/* Order Total */}
        <div>
          <Card className="sticky top-6">
            <CardContent className="p-6">
              <h2 className="text-lg font-medium mb-4">Payment Summary</h2>

              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Tax (7%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tip</span>
                    <span>${tip.toFixed(2)}</span>
                  </div>
                  <div className="flex gap-2">
                    {[10, 15, 20].map((percentage) => (
                      <button
                        key={percentage}
                        onClick={() => setTipPercentage(percentage)}
                        className={`flex-1 py-2 px-3 rounded-md text-sm ${
                          tipPercentage === percentage
                            ? "bg-primary-100 text-primary-800 border border-primary-200"
                            : "bg-gray-100 text-gray-800 border border-gray-200"
                        }`}
                      >
                        {percentage}%
                      </button>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full mt-6"
                onClick={handlePlaceOrder}
              >
                Place Order
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
