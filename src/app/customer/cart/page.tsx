"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/shared/EmptyState";
import { useMenu } from "@/components/providers/MenuProvider";
import { MenuItem } from "@/lib/utils/store";

interface ExtendedMenuItem extends MenuItem {
  imageSrc?: string;
}
interface CartItem {
  id: number;
  name: string;
  price: number;
  basePrice: number;
  quantity: number;
  selectedOptions?: string[];
  selectedSize?: string;
  specialInstructions?: string;
}

export default function CartPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items: menuItems } = useMenu();
  const restaurantId = searchParams.get("restaurant");
  const tableId = searchParams.get("table");
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect to scan page if restaurant or table ID is not present
  useEffect(() => {
    if (!restaurantId || !tableId) {
      router.push("/customer/scan");
      return;
    }
  }, [restaurantId, tableId, router]);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse cart from localStorage:", error);
      }
    }
    setIsLoading(false);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (cartItems.length === 0) {
      localStorage.removeItem("cartItems");
    } else {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));
    }
  }, [cartItems]);

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeItem = (itemId: number) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const calculateItemPrice = (cartItem: CartItem) => {
    const price = cartItem.basePrice;
    // Add prices for selected options and size if present
    return price * cartItem.quantity;
  };

  const subtotal = cartItems.reduce(
    (total, cartItem) => total + calculateItemPrice(cartItem),
    0
  );

  if (isLoading) {
    return <div className="max-w-4xl mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
        <Link
          href={`/customer/menu?restaurant=${restaurantId}&table=${tableId}`}
        >
          <Button variant="outline">Continue Shopping</Button>
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Add some items to your cart to get started!"
          action={{
            label: "Browse Menu",
            onClick: () =>
              router.push(
                `/customer/menu?restaurant=${restaurantId}&table=${tableId}`
              ),
          }}
        />
      ) : (
        <div className="space-y-6">
          {cartItems.map((cartItem) => {
            // Get the full menu item details
            const menuItem = menuItems.find(
              (item) => String(item.id) === String(cartItem.id)
            );
            if (!menuItem) return null;

            return (
              <Card key={cartItem.id} className="p-4">
                <div className="flex items-center gap-4">
                  {" "}
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0">
                    {(menuItem as ExtendedMenuItem).imageSrc && (
                      <Image
                        src={(menuItem as ExtendedMenuItem).imageSrc!}
                        alt={menuItem.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {cartItem.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {menuItem.description}
                    </p>
                    <div className="mt-1">
                      {menuItem.tags?.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          size="sm"
                          className="mr-1"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    {cartItem.selectedSize && (
                      <p className="text-sm text-gray-600 mt-1">
                        Size: {cartItem.selectedSize}
                      </p>
                    )}
                    {cartItem.selectedOptions &&
                      cartItem.selectedOptions.length > 0 && (
                        <p className="text-sm text-gray-600">
                          Options: {cartItem.selectedOptions.join(", ")}
                        </p>
                      )}
                    {cartItem.specialInstructions && (
                      <p className="text-sm text-gray-600">
                        Note: {cartItem.specialInstructions}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {" "}
                    <div className="flex items-center border rounded-md">
                      <button
                        className="px-3 py-1 text-gray-700 hover:bg-gray-100 font-medium"
                        onClick={() =>
                          updateQuantity(cartItem.id, cartItem.quantity - 1)
                        }
                      >
                        -
                      </button>
                      <span className="px-3 py-1 border-x">
                        {cartItem.quantity}
                      </span>
                      <button
                        className="px-3 py-1 text-gray-700 hover:bg-gray-100 font-medium"
                        onClick={() =>
                          updateQuantity(cartItem.id, cartItem.quantity + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        ${calculateItemPrice(cartItem).toFixed(2)}
                      </div>{" "}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-800 hover:bg-red-50 p-1"
                        onClick={() => removeItem(cartItem.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          <div className="border-t pt-6">
            <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <p className="mt-0.5 text-sm text-gray-500 mb-6">
              Taxes calculated at checkout.
            </p>
            <Link
              href={`/customer/checkout?restaurant=${restaurantId}&table=${tableId}`}
            >
              <Button variant="primary" className="w-full">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
