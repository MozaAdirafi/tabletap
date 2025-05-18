// src/app/customer/menu/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { validateQrCode } from "@/lib/firebase/firestore";
import { MenuProvider, useMenu } from "@/components/providers/MenuProvider";
import { getMenuCategoriesFromDB } from "@/lib/firebase/firestore";
import { getRestaurantByID } from "@/lib/firebase/restaurant";
import { MenuItem } from "@/lib/utils/store";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  basePrice: number;
  selectedOptions?: string[];
  selectedSize?: string;
  specialInstructions?: string;
}

interface MenuCategory {
  id: string;
  name: string;
  description?: string;
}

interface ExtendedMenuItem extends MenuItem {
  imageSrc?: string;
}

function MenuContent() {
  const { items, loading, error } = useMenu();
  const [cart, setCart] = useState<{ items: CartItem[]; total: number }>({
    items: [],
    total: 0,
  });
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>();
  const [restaurantName, setRestaurantName] = useState<string>("");
  const searchParams = useSearchParams();
  const restaurantId = searchParams.get("restaurant");
  const tableId = searchParams.get("table");

  // Load restaurant details
  useEffect(() => {
    const loadRestaurantDetails = async () => {
      if (!restaurantId) return;
      try {
        const restaurant = await getRestaurantByID(restaurantId);
        if (restaurant) {
          setRestaurantName(restaurant.name);
        } else {
          setRestaurantName(`Restaurant ${restaurantId.substring(0, 6)}`);
        }
      } catch (error) {
        console.error("Error loading restaurant details:", error);
        setRestaurantName(`Restaurant ${restaurantId.substring(0, 6)}`);
      }
    };
    loadRestaurantDetails();
  }, [restaurantId]);

  // Load menu categories from Firebase
  useEffect(() => {
    const loadCategories = async () => {
      if (!restaurantId) return;
      try {
        const cats = await getMenuCategoriesFromDB(restaurantId);
        setCategories(cats);
        if (cats.length > 0) {
          setActiveCategory(cats[0].id);
        }
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    };
    loadCategories();
  }, [restaurantId]);

  // Load cart from localStorage and update on any changes
  useEffect(() => {
    const loadCart = () => {
      const savedCart = localStorage.getItem("cartItems");
      if (savedCart) {
        try {
          let cartItems = JSON.parse(savedCart) as CartItem[];
          // Filter out dummy/test/invalid items (e.g., name is 'fdas', 'bbb', or price is not a number)
          cartItems = cartItems.filter(
            (item) =>
              item &&
              typeof item.name === "string" &&
              !["fdas", "bbb", "test", "dummy"].includes(item.name.toLowerCase()) &&
              typeof item.price === "number" &&
              !isNaN(item.price) &&
              item.price > 0 &&
              item.quantity > 0
          );
          // If we removed any items, update localStorage
          if (cartItems.length === 0) {
            localStorage.removeItem("cartItems");
          } else {
            localStorage.setItem("cartItems", JSON.stringify(cartItems));
          }
          const total = cartItems.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
          setCart({ items: cartItems, total });
        } catch (error) {
          console.error("Failed to parse cart:", error);
          setCart({ items: [], total: 0 });
          localStorage.removeItem("cartItems");
        }
      } else {
        setCart({ items: [], total: 0 });
      }
    };

    // Load cart initially
    loadCart();

    // Listen for storage events to update cart when changed in other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "cartItems") {
        loadCart();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleAddToCart = (item: {
    id: string;
    name: string;
    price: number | string;
  }) => {
    const basePrice =
      typeof item.price === "string" ? parseFloat(item.price) : item.price;
    const existingItem = cart.items.find((cartItem) => cartItem.id === item.id);
    let newCartItems: CartItem[];

    if (existingItem) {
      newCartItems = cart.items.map((cartItem) =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + 1, price: basePrice }
          : cartItem
      );
    } else {
      newCartItems = [
        ...cart.items,
        {
          id: item.id,
          name: item.name,
          price: basePrice,
          basePrice: basePrice,
          quantity: 1,
        },
      ];
    }

    const newTotal = newCartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const newCart = { items: newCartItems, total: newTotal };
    setCart(newCart);
    localStorage.setItem("cartItems", JSON.stringify(newCartItems));
  };

  // Remove item from cart
  const handleRemoveFromCart = (itemId: string) => {
    const newCartItems = cart.items.filter((item) => item.id !== itemId);
    const newTotal = newCartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    setCart({ items: newCartItems, total: newTotal });
    localStorage.setItem("cartItems", JSON.stringify(newCartItems));
  };

  if (error) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-200 h-48 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredItems = activeCategory
    ? items.filter((item) => item.categoryId === activeCategory)
    : items;

  return (
    <>
      {" "}
      <div className="container mx-auto px-4 py-8 pb-32">
        {/* Restaurant Name and Table Number */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">
            {restaurantName
              ? restaurantName
              : `Restaurant ${restaurantId?.substring(0, 6) || "Unknown"}`}
          </h1>
          <p className="text-gray-600">Table {tableId}</p>
        </div>{" "}
        {/* Category Navigation */}
        <div className="flex overflow-x-auto gap-2 mb-8 pb-2">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`px-4 py-2 rounded-full whitespace-nowrap text-sm ${
                activeCategory === category.id
                  ? "bg-blue-600 text-white font-medium"
                  : "bg-gray-100 text-gray-800 hover:bg-gray-200"
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
        {/* Menu Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredItems.map((item) => {
            const cartItem = cart.items.find(
              (cartItem) => cartItem.id === item.id
            );
            const menuItem = item as ExtendedMenuItem;
            return (
              <Card key={item.id} className="h-full">
                <div className="flex h-40">
                  <div className="w-1/3 bg-gray-200 relative">
                    {menuItem.imageSrc ? (
                      <Image
                        src={menuItem.imageSrc}
                        alt={item.name}
                        width={160}
                        height={160}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-8 w-8 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="w-2/3 p-4 flex flex-col justify-between">
                    <div>
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                      {item.tags && item.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant={
                                tag.toLowerCase() === "vegetarian"
                                  ? "success"
                                  : tag.toLowerCase() === "spicy"
                                  ? "danger"
                                  : tag.toLowerCase() === "popular"
                                  ? "primary"
                                  : "default"
                              }
                              size="sm"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <p className="font-medium">
                        $
                        {(typeof item.price === "string"
                          ? parseFloat(item.price)
                          : item.price
                        ).toFixed(2)}
                      </p>
                      <div className="flex items-center gap-2">
                        {cartItem && (
                          <span className="text-sm text-gray-600">
                            × {cartItem.quantity}
                          </span>
                        )}{" "}
                        <div className="flex space-x-2">
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() =>
                              handleAddToCart({
                                id: item.id,
                                name: item.name,
                                price: item.price,
                              })
                            }
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      {/* Cart Summary Fixed at Bottom */}
      {cart.items.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-white border-t shadow-lg">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                {cart.items.length} items in cart
              </p>
              <p className="font-medium">${cart.total.toFixed(2)}</p>
            </div>{" "}
            <div className="flex items-center gap-4">
              {/* List cart items with remove button */}
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center gap-2 border-r pr-4 last:border-r-0 last:pr-0">
                  <span className="text-sm">{item.name} × {item.quantity}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveFromCart(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Link
                href={`/customer/cart?restaurant=${restaurantId}&table=${tableId}`}
              >
                <Button variant="primary" size="md">
                  View Cart
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function CustomerMenuPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tableId = searchParams.get("table");
  const restaurantId =
    searchParams.get("restaurant") ||
    process.env.NEXT_PUBLIC_DEFAULT_RESTAURANT_ID;
  const [validationError, setValidationError] = useState<string | null>(null);

  // Validate table and restaurant IDs
  useEffect(() => {
    const validateAccess = async () => {
      if (!tableId || !restaurantId) {
        router.push("/customer/scan");
        return;
      }

      try {
        const result = await validateQrCode(restaurantId, parseInt(tableId));
        if (!result?.isValid) {
          setValidationError(
            "Invalid table or restaurant. Please scan the QR code again."
          );
          setTimeout(() => router.push("/customer/scan"), 3000);
          return;
        }
      } catch (error) {
        console.error("Error validating access:", error);
        setValidationError("Something went wrong. Please try again.");
        setTimeout(() => router.push("/customer/scan"), 3000);
      }
    };

    validateAccess();
  }, [tableId, restaurantId, router]);

  if (validationError) {
    return (
      <div className="max-w-md mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {validationError}
        </div>
      </div>
    );
  }

  if (!restaurantId || !tableId) {
    return null;
  }

  return (
    <MenuProvider restaurantId={restaurantId}>
      <MenuContent />
    </MenuProvider>
  );
}
