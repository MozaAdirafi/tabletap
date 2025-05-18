import { doc, deleteDoc } from "firebase/firestore";
import {
  getOrdersFromDB,
  addOrderToDB,
  updateOrderStatusInDB,
  getOrdersRef,
} from "@/lib/firebase/firestore";

// Types
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description: string;
  available: boolean;
  tags: string[];
  categoryId: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
}
export interface CartItem {
  id: number;
  name: string;
  price: number;
  basePrice: number;
  quantity: number;
  selectedOptions?: string[];
  selectedSize?: string;
  specialInstructions?: string;
}

export interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
}

export interface Order {
  id: number;
  tableId: string;
  items: OrderItem[]; // Changed from CartItem[] to OrderItem[]
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  createdAt: Date;
  totalAmount: number;
}

// Event handling for real-time updates
type Listener = () => void;
type OrderListener = (order: Order) => void;

const menuListeners: Listener[] = [];
const orderListeners: OrderListener[] = [];

export const subscribeToMenuUpdates = (listener: Listener) => {
  menuListeners.push(listener);
  return () => {
    const index = menuListeners.indexOf(listener);
    if (index > -1) {
      menuListeners.splice(index, 1);
    }
  };
};

export const subscribeToOrderUpdates = (
  restaurantId: string,
  listener: OrderListener
) => {
  // TODO: Use restaurantId to filter orders from specific restaurant
  orderListeners.push(listener);
  return () => {
    const index = orderListeners.indexOf(listener);
    if (index > -1) {
      orderListeners.splice(index, 1);
    }
  };
};

const notifyMenuListeners = () => {
  menuListeners.forEach((listener) => listener());
};

const notifyOrderListeners = (order: Order) => {
  orderListeners.forEach((listener) => listener(order));
};

// Temporary storage until Firebase integration
let menuItems: MenuItem[] = [
  {
    id: "1",
    name: "Classic Burger",
    description:
      "Juicy beef patty with fresh lettuce, tomato, and our special sauce",
    price: 12.99,
    available: true,
    tags: ["Popular", "Meat"],
    categoryId: "burgers",
  },
  {
    id: "2",
    name: "Caesar Salad",
    description:
      "Fresh romaine lettuce, croutons, parmesan cheese with caesar dressing",
    price: 8.99,
    available: true,
    tags: ["Vegetarian", "Healthy"],
    categoryId: "salads",
  },
];

let menuCategories: MenuCategory[] = [
  {
    id: "burgers",
    name: "Burgers",
    description: "Our signature burgers",
  },
  {
    id: "salads",
    name: "Salads",
    description: "Fresh and healthy options",
  },
];

// Menu item operations
export const getMenuItems = (): MenuItem[] => menuItems;

export const addMenuItem = (item: MenuItem) => {
  menuItems.push(item);
  notifyMenuListeners();
};

export const updateMenuItem = (item: MenuItem) => {
  const index = menuItems.findIndex((i) => i.id === item.id);
  if (index !== -1) {
    menuItems[index] = item;
    notifyMenuListeners();
  }
};

export const deleteMenuItem = (id: string) => {
  menuItems = menuItems.filter((item) => item.id !== id);
  notifyMenuListeners();
};

// Category operations
export const getMenuCategories = (): MenuCategory[] => menuCategories;

export const addMenuCategory = (category: MenuCategory) => {
  menuCategories.push(category);
  notifyMenuListeners();
};

export const updateMenuCategory = (category: MenuCategory) => {
  const index = menuCategories.findIndex((c) => c.id === category.id);
  if (index !== -1) {
    menuCategories[index] = category;
    notifyMenuListeners();
  }
};

export const deleteMenuCategory = (id: string) => {
  menuCategories = menuCategories.filter((category) => category.id !== id);
  notifyMenuListeners();
};

// Order operations
export const getOrders = async (restaurantId: string): Promise<Order[]> => {
  if (!restaurantId) throw new Error("Restaurant ID is not set");
  return await getOrdersFromDB(restaurantId);
};

export const addOrder = async (
  restaurantId: string,
  order: Omit<Order, "id">
): Promise<Order> => {
  if (!restaurantId) throw new Error("Restaurant ID is not set");
  const newOrder = await addOrderToDB(restaurantId, order);
  notifyOrderListeners(newOrder);
  return newOrder;
};

export const updateOrderStatus = async (
  restaurantId: string,
  orderId: number,
  status: Order["status"]
): Promise<void> => {
  if (!restaurantId) throw new Error("Restaurant ID is not set");
  await updateOrderStatusInDB(restaurantId, orderId, status);
};

export const getOrderById = async (
  restaurantId: string,
  id: number
): Promise<Order | undefined> => {
  if (!restaurantId) throw new Error("Restaurant ID is not set");
  const orders = await getOrdersFromDB(restaurantId);
  return orders.find((order: Order) => order.id === id);
};

export const deleteOrder = async (
  restaurantId: string,
  id: number
): Promise<void> => {
  if (!restaurantId) throw new Error("Restaurant ID is not set");
  const orderRef = doc(getOrdersRef(restaurantId), id.toString());
  await deleteDoc(orderRef);
};
