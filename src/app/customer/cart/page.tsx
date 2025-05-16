'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/shared/EmptyState';

interface CartItem {
  id: number;
  quantity: number;
}

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

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
      }
    }
    // In a real app, fetch menu items from API
    setMenuItems(sampleMenuItems);
    setIsLoading(false);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const updateQuantity = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeItem = (itemId: number) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const subtotal = cartItems.reduce((total, cartItem) => {
    const menuItem = menuItems.find(item => item.id === cartItem.id);
    return total + (menuItem ? menuItem.price * cartItem.quantity : 0);
  }, 0);

  if (isLoading) {
    return <div className="max-w-4xl mx-auto px-4 py-8">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
        <Link href="/customer/menu">
          <Button variant="outline">Continue Shopping</Button>
        </Link>
      </div>

      {cartItems.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Add some items to your cart to get started!"
          action={{
            label: "Browse Menu",
            onClick: () => window.location.href = '/customer/menu'
          }}
        />
      ) : (
        <div className="space-y-6">
          {cartItems.map((cartItem) => {
            const menuItem = menuItems.find(item => item.id === cartItem.id);
            if (!menuItem) return null;

            return (
              <Card key={cartItem.id} className="p-4">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex-shrink-0">
                    {menuItem.image && (
                      <img
                        src={menuItem.image}
                        alt={menuItem.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{menuItem.name}</h3>
                    <p className="text-sm text-gray-500">{menuItem.description}</p>
                    <div className="mt-1">
                      {menuItem.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" size="sm" className="mr-1">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center border rounded-md">
                      <button
                        className="px-3 py-1 text-gray-600 hover:text-gray-900"
                        onClick={() => updateQuantity(cartItem.id, cartItem.quantity - 1)}
                      >
                        -
                      </button>
                      <span className="px-3 py-1 border-x">{cartItem.quantity}</span>
                      <button
                        className="px-3 py-1 text-gray-600 hover:text-gray-900"
                        onClick={() => updateQuantity(cartItem.id, cartItem.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        ${(menuItem.price * cartItem.quantity).toFixed(2)}
                      </div>
                      <button
                        className="text-sm text-red-600 hover:text-red-800"
                        onClick={() => removeItem(cartItem.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}

          <div className="border-t pt-6">
            <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
              <p>Subtotal</p>
              <p>${subtotal.toFixed(2)}</p>
            </div>
            <p className="mt-0.5 text-sm text-gray-500 mb-6">
              Taxes calculated at checkout.
            </p>
            <Link href="/customer/checkout">
              <Button variant="primary" fullWidth>
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

// Sample data for the menu page
const sampleCategories: Category[] = [
  { id: 'appetizers', name: 'Appetizers' },
  { id: 'main-courses', name: 'Main Courses' },
  { id: 'desserts', name: 'Desserts' },
  { id: 'beverages', name: 'Beverages' },
  { id: 'sides', name: 'Sides' },
];

const sampleMenuItems: MenuItem[] = [
  {
    id: 1,
    name: 'Classic Cheeseburger',
    description: 'Juicy beef patty with cheddar cheese, lettuce, tomato, and our special sauce on a brioche bun.',
    price: 12.99,
    category: 'main-courses',
    tags: ['Popular'],
    available: true,
  },
  {
    id: 2,
    name: 'French Fries',
    description: 'Crispy golden fries seasoned with sea salt.',
    price: 4.99,
    category: 'sides',
    tags: ['Vegetarian'],
    available: true,
  },
  {
    id: 3,
    name: 'Chocolate Brownie',
    description: 'Rich, fudgy brownie served warm with vanilla ice cream and chocolate sauce.',
    price: 6.99,
    category: 'desserts',
    tags: ['Vegetarian', 'Popular'],
    available: true,
  },
  {
    id: 4,
    name: 'Caesar Salad',
    description: 'Crisp romaine lettuce with parmesan cheese, croutons, and Caesar dressing.',
    price: 9.99,
    category: 'appetizers',
    tags: ['Vegetarian'],
    available: true,
  },
  {
    id: 5,
    name: 'Margherita Pizza',
    description: 'Traditional pizza with tomato sauce, fresh mozzarella, and basil on our hand-tossed crust.',
    price: 14.99,
    category: 'main-courses',
    tags: ['Vegetarian', 'Popular'],
    available: true,
  },
  {
    id: 6,
    name: 'Buffalo Wings',
    description: 'Crispy chicken wings tossed in spicy buffalo sauce, served with celery and blue cheese dressing.',
    price: 10.99,
    category: 'appetizers',
    tags: ['Spicy'],
    available: true,
  },
  {
    id: 7,
    name: 'Soft Drink',
    description: 'Choose from Coca-Cola, Diet Coke, Sprite, or Fanta.',
    price: 2.49,
    category: 'beverages',
    tags: [],
    available: true,
  },
  {
    id: 8,
    name: 'Grilled Salmon',
    description: 'Fresh Atlantic salmon fillet, grilled to perfection and served with seasonal vegetables.',
    price: 18.99,
    category: 'main-courses',
    tags: ['Healthy'],
    available: true,
  },
  {
    id: 9,
    name: 'Chocolate Milkshake',
    description: 'Rich and creamy chocolate milkshake topped with whipped cream.',
    price: 5.99,
    category: 'beverages',
    tags: ['Vegetarian'],
    available: true,
  },
  {
    id: 10,
    name: 'Onion Rings',
    description: 'Crispy battered onion rings served with dipping sauce.',
    price: 6.99,
    category: 'sides',
    tags: ['Vegetarian'],
    available: true,
  },
];