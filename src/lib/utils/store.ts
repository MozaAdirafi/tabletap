// Types
export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  available: boolean;
  tags: string[];
  imageSrc?: string;
  categoryId: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
}

export interface Order {
  id: number;
  tableId: string;
  items: { menuItem: MenuItem; quantity: number }[];
  status: "pending" | "preparing" | "ready" | "delivered" | "cancelled";
  totalAmount: number;
  createdAt: Date;
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

export const subscribeToOrderUpdates = (listener: OrderListener) => {
  orderListeners.push(listener);
  return () => {
    const index = orderListeners.indexOf(listener);
    if (index > -1) {
      orderListeners.splice(index, 1);
    }
  };
};

const notifyMenuListeners = () => {
  menuListeners.forEach(listener => listener());
};

const notifyOrderListeners = (order: Order) => {
  orderListeners.forEach(listener => listener(order));
};

// Mock data and storage functions
let menuItems: MenuItem[] = [
  {
    id: 1,
    name: "Classic Burger",
    description:
      "Juicy beef patty with fresh lettuce, tomato, and our special sauce",
    price: 12.99,
    available: true,
    tags: ["Popular", "Meat"],
    categoryId: "burgers",
  },
  {
    id: 2,
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

let orders: Order[] = [];

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

export const deleteMenuItem = (id: number) => {
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
export const getOrders = (): Order[] => orders;

export const addOrder = (order: Order) => {
  // Generate a unique ID if not provided
  if (!order.id) {
    order.id = orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1;
  }
  
  // Set createdAt if not provided
  if (!order.createdAt) {
    order.createdAt = new Date();
  }
  
  orders.push(order);
  notifyOrderListeners(order);
};

export const updateOrderStatus = (orderId: number, status: Order["status"]) => {
  const order = orders.find((o) => o.id === orderId);
  if (order) {
    order.status = status;
    notifyOrderListeners(order);
  }
};

export const deleteOrder = (id: number) => {
  orders = orders.filter((order) => order.id !== id);
};

// Get order by ID
export const getOrderById = (id: number): Order | undefined => {
  return orders.find(order => order.id === id);
};

// Get orders by table ID
export const getOrdersByTable = (tableId: string): Order[] => {
  return orders.filter(order => order.tableId === tableId);
};
