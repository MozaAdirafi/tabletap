// src/app/customer/menu/page.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  tags: string[];
  image?: string;
  available: boolean;
}

interface Category {
  id: string;
  name: string;
}

export default function MenuPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlTableNumber = searchParams.get("table");
  const [tableNumber, setTableNumber] = useState<string>("No table selected");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    // Get table number from URL or storage
    if (urlTableNumber) {
      // If URL has table number, use it and update storage
      setTableNumber(urlTableNumber);
      localStorage.setItem("tableId", urlTableNumber);
    } else {
      // If no URL table number, try to get from storage
      const storedTableId = localStorage.getItem("tableId");
      if (storedTableId) {
        setTableNumber(storedTableId);
        // Redirect to include table number in URL for consistency
        router.push(`/customer/menu?table=${storedTableId}`);
      } else {
        // If no table number anywhere, redirect to scan
        router.push("/customer/scan");
        return;
      }
    }

    // Rest of your existing useEffect code for loading cart...
    const loadCart = () => {
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
    };

    loadCart();
    window.addEventListener("storage", loadCart);
    return () => window.removeEventListener("storage", loadCart);
  }, [searchParams, router, urlTableNumber]);

  // Load menu data
  useEffect(() => {
    const timer = setTimeout(() => {
      setMenuItems(sampleMenuItems);
      setCategories(sampleCategories);
      setSelectedCategory(sampleCategories[0].id);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getCartItemQuantity = (itemId: number) => {
    const item = cartItems.find((item) => item.id === itemId);
    return item ? item.quantity : 0;
  };

  const getTotalCartItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalCartPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const removeItemFromCart = (itemId: number) => {
    try {
      const updatedCart = cartItems.filter((item) => item.id !== itemId);
      setCartItems(updatedCart);
      localStorage.setItem("cartItems", JSON.stringify(updatedCart));
      sessionStorage.setItem("cartItems", JSON.stringify(updatedCart));
    } catch (error) {
      console.error("Failed to remove item from cart:", error);
    }
  };

  // Update the filtered items to include a removal button
  const filteredItems = menuItems.filter((item) => {
    // Filter by category if one is selected
    const matchesCategory = selectedCategory
      ? item.category === selectedCategory
      : true;

    // Filter by search query if one is entered
    const matchesSearch = searchQuery
      ? item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    return matchesCategory && matchesSearch && item.available;
  });

  return (
    <div className="min-h-screen pb-16">
      {/* Header */}
      <header className="bg-white sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mr-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fillRule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">
                The Gourmet Kitchen
              </h1>
              <p className="text-sm text-gray-500">Table {tableNumber}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Checkout Banner - Show when items in cart */}
      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t z-20">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">
                  {getTotalCartItems()} items in cart
                </p>
                <p className="text-lg font-bold text-gray-900">
                  ${getTotalCartPrice().toFixed(2)}
                </p>
              </div>
              <Link href="/customer/checkout">
                <Button variant="primary" size="lg">
                  Proceed to Checkout
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Rest of the menu content */}
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <Input
            placeholder="Search menu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
          />
        </div>

        {/* Categories */}
        <div className="mb-8">
          {menuItems.length === 0 ? (
            <div className="flex overflow-x-auto pb-2 space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-32 rounded-full" />
              ))}
            </div>
          ) : (
            <div className="flex overflow-x-auto pb-2 space-x-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium ${
                    selectedCategory === category.id
                      ? "bg-primary-100 text-primary-800 border border-primary-200"
                      : "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-transparent"
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Menu Items */}
        <div className="space-y-6 mb-20">
          {" "}
          {/* Added margin bottom for checkout banner */}
          {menuItems.length === 0 ? (
            // Loading skeletons
            Array(3)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="bg-white rounded-lg shadow overflow-hidden"
                >
                  <div className="md:flex">
                    <div className="md:w-1/3">
                      <Skeleton className="h-40 md:h-full w-full" />
                    </div>
                    <div className="p-4 md:w-2/3">
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-3" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-8 w-20" />
                        <Skeleton className="h-10 w-32" />
                      </div>
                    </div>
                  </div>
                </div>
              ))
          ) : filteredItems.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 mx-auto text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No menu items found
              </h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search or filter criteria
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory(categories[0].id);
                }}
              >
                Reset Filters
              </Button>
            </div>
          ) : (
            // Menu items
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="md:flex">
                  <div className="md:w-1/3 h-40 md:h-auto bg-gray-200 relative">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12"
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
                  <div className="p-4 md:w-2/3">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-lg text-gray-900">
                        {item.name}
                      </h3>
                      <span className="font-medium text-gray-900">
                        ${item.price.toFixed(2)}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {item.tags.map((tag, index) => (
                          <Badge
                            key={index}
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

                    <div className="flex items-center justify-between mt-auto">
                      {getCartItemQuantity(item.id) > 0 && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-primary-600">
                            {getCartItemQuantity(item.id)} in cart
                          </span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              removeItemFromCart(item.id);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </button>
                        </div>
                      )}

                      <Link href={`/customer/menu/${item.id}`}>
                        <Button variant="primary">
                          {getCartItemQuantity(item.id) > 0
                            ? "Update Order"
                            : "Add to Cart"}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// Sample data for the menu page
const sampleCategories: Category[] = [
  { id: "appetizers", name: "Appetizers" },
  { id: "main-courses", name: "Main Courses" },
  { id: "desserts", name: "Desserts" },
  { id: "beverages", name: "Beverages" },
  { id: "sides", name: "Sides" },
];

const sampleMenuItems: MenuItem[] = [
  {
    id: 1,
    name: "Classic Cheeseburger",
    description:
      "Juicy beef patty with cheddar cheese, lettuce, tomato, and our special sauce on a brioche bun.",
    price: 12.99,
    category: "main-courses",
    tags: ["Popular"],
    available: true,
  },
  {
    id: 2,
    name: "French Fries",
    description: "Crispy golden fries seasoned with sea salt.",
    price: 4.99,
    category: "sides",
    tags: ["Vegetarian"],
    available: true,
  },
  {
    id: 3,
    name: "Chocolate Brownie",
    description:
      "Rich, fudgy brownie served warm with vanilla ice cream and chocolate sauce.",
    price: 6.99,
    category: "desserts",
    tags: ["Vegetarian", "Popular"],
    available: true,
  },
  {
    id: 4,
    name: "Caesar Salad",
    description:
      "Crisp romaine lettuce with parmesan cheese, croutons, and Caesar dressing.",
    price: 9.99,
    category: "appetizers",
    tags: ["Vegetarian"],
    available: true,
  },
  {
    id: 5,
    name: "Margherita Pizza",
    description:
      "Traditional pizza with tomato sauce, fresh mozzarella, and basil on our hand-tossed crust.",
    price: 14.99,
    category: "main-courses",
    tags: ["Vegetarian", "Popular"],
    available: true,
  },
  {
    id: 6,
    name: "Buffalo Wings",
    description:
      "Crispy chicken wings tossed in spicy buffalo sauce, served with celery and blue cheese dressing.",
    price: 10.99,
    category: "appetizers",
    tags: ["Spicy"],
    available: true,
  },
  {
    id: 7,
    name: "Soft Drink",
    description: "Choose from Coca-Cola, Diet Coke, Sprite, or Fanta.",
    price: 2.49,
    category: "beverages",
    tags: [],
    available: true,
  },
  {
    id: 8,
    name: "Grilled Salmon",
    description:
      "Fresh Atlantic salmon fillet, grilled to perfection and served with seasonal vegetables.",
    price: 18.99,
    category: "main-courses",
    tags: ["Healthy"],
    available: true,
  },
  {
    id: 9,
    name: "Chocolate Milkshake",
    description:
      "Rich and creamy chocolate milkshake topped with whipped cream.",
    price: 5.99,
    category: "beverages",
    tags: ["Vegetarian"],
    available: true,
  },
  {
    id: 10,
    name: "Onion Rings",
    description: "Crispy battered onion rings served with dipping sauce.",
    price: 6.99,
    category: "sides",
    tags: ["Vegetarian"],
    available: true,
  },
];
