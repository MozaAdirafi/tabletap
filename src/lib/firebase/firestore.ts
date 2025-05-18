import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  onSnapshot,
  Timestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "./firebase";
import { MenuItem, MenuCategory, Order } from "@/lib/utils/store";

interface Table {
  id: string;
  number: number;
  createdAt: Timestamp;
}

interface Restaurant {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  description?: string;
  openingHours?: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
  [key: string]: any; // Allow for additional fields
}

// Restaurant specific collection references
const getRestaurantRef = (restaurantId: string) => {
  // Replace any + with - in the restaurantId to match Firebase Auth UIDs
  const encodedId = restaurantId.replace(/\+/g, "-");
  return doc(db, "restaurants", encodedId);
};

// Get restaurant details
export const getRestaurantByID = async (
  restaurantId: string
): Promise<{ id: string; name: string } | null> => {
  try {
    const restaurantRef = getRestaurantRef(restaurantId);
    const restaurantDoc = await getDoc(restaurantRef);

    if (restaurantDoc.exists()) {
      const data = restaurantDoc.data();
      return {
        id: restaurantDoc.id,
        name: data.name || `Restaurant ${restaurantId.substring(0, 6)}`,
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching restaurant:", error);
    return null;
  }
};
const getMenuItemsRef = (restaurantId: string) =>
  collection(getRestaurantRef(restaurantId), "menuItems");
const getMenuCategoriesRef = (restaurantId: string) =>
  collection(getRestaurantRef(restaurantId), "menuCategories");
export const getOrdersRef = (restaurantId: string) =>
  collection(getRestaurantRef(restaurantId), "orders");
const getTablesRef = (restaurantId: string) =>
  collection(getRestaurantRef(restaurantId), "tables");

// Menu Items
export const getMenuItemsFromDB = async (
  restaurantId: string
): Promise<MenuItem[]> => {
  const menuItemsRef = getMenuItemsRef(restaurantId);
  const snapshot = await getDocs(menuItemsRef);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as MenuItem)
  );
};

export const addMenuItemToDB = async (
  restaurantId: string,
  item: Omit<MenuItem, "id">
): Promise<MenuItem> => {
  const menuItemsRef = getMenuItemsRef(restaurantId);
  const docRef = await addDoc(menuItemsRef, {
    ...item,
    createdAt: serverTimestamp(),
    // Set the id field to the generated document ID
    id: "pending", // temporary placeholder
  });
  // Now update the document to set the id field to the generated ID
  await updateDoc(docRef, { id: docRef.id });
  return { ...item, id: docRef.id };
};

export const updateMenuItemInDB = async (
  restaurantId: string,
  item: MenuItem
): Promise<void> => {
  const menuItemRef = doc(getMenuItemsRef(restaurantId), item.id);
  await updateDoc(menuItemRef, {
    ...item,
    updatedAt: serverTimestamp(),
  });
};

export const deleteMenuItemFromDB = async (
  restaurantId: string,
  id: string
): Promise<void> => {
  const menuItemRef = doc(getMenuItemsRef(restaurantId), id);
  await deleteDoc(menuItemRef);
};

// Categories
export const getMenuCategoriesFromDB = async (
  restaurantId: string
): Promise<MenuCategory[]> => {
  const categoriesRef = getMenuCategoriesRef(restaurantId);
  const snapshot = await getDocs(categoriesRef);
  return snapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as MenuCategory)
  );
};

export const addMenuCategoryToDB = async (
  restaurantId: string,
  category: MenuCategory
): Promise<void> => {
  const categoriesRef = getMenuCategoriesRef(restaurantId);
  await addDoc(categoriesRef, {
    ...category,
    createdAt: serverTimestamp(),
  });
};

export const updateMenuCategoryInDB = async (
  restaurantId: string,
  category: MenuCategory
): Promise<void> => {
  const categoryRef = doc(getMenuCategoriesRef(restaurantId), category.id);
  await updateDoc(categoryRef, {
    ...category,
    updatedAt: serverTimestamp(),
  });
};

export const deleteMenuCategoryFromDB = async (
  restaurantId: string,
  id: string
): Promise<void> => {
  const categoryRef = doc(getMenuCategoriesRef(restaurantId), id);
  await deleteDoc(categoryRef);
};

// Orders
export const getOrdersFromDB = async (
  restaurantId: string
): Promise<Order[]> => {
  const ordersRef = getOrdersRef(restaurantId);
  const q = query(ordersRef, orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (doc) =>
      ({
        id: parseInt(doc.id),
        ...doc.data(),
        createdAt: (doc.data().createdAt as Timestamp).toDate(),
      } as Order)
  );
};

export const addOrderToDB = async (
  restaurantId: string,
  order: Omit<Order, "id">
): Promise<Order> => {
  const ordersRef = getOrdersRef(restaurantId);

  // Generate a numeric ID based on timestamp
  const timestamp = Date.now();
  const numericId = parseInt(timestamp.toString().slice(-8));

  // Create a new document with the numeric ID
  const orderDoc = doc(ordersRef, numericId.toString());
  await setDoc(orderDoc, {
    ...order,
    id: numericId,
    createdAt: serverTimestamp(),
  });

  return { ...order, id: numericId };
};

export const updateOrderStatusInDB = async (
  restaurantId: string,
  orderId: number,
  status: Order["status"]
): Promise<void> => {
  try {
    const ordersRef = getOrdersRef(restaurantId);
    const orderSnap = await getDocs(
      query(ordersRef, where("id", "==", orderId))
    );

    if (orderSnap.empty) {
      throw new Error(
        `Order ${orderId} not found for restaurant ${restaurantId}`
      );
    }

    const orderDoc = orderSnap.docs[0];
    await updateDoc(orderDoc.ref, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error(
      `Failed to update order status for restaurant=${restaurantId}, orderId=${orderId}, status=${status}:`,
      error
    );
    throw new Error(
      `Failed to update order status: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Real-time listeners
export const subscribeToOrders = (
  restaurantId: string,
  callback: (orders: Order[]) => void
) => {
  const ordersRef = getOrdersRef(restaurantId);
  const q = query(ordersRef, orderBy("createdAt", "desc"));

  return onSnapshot(q, (snapshot) => {
    const orders = snapshot.docs.map(
      (doc) =>
        ({
          id: parseInt(doc.id),
          ...doc.data(),
          createdAt: (doc.data().createdAt as Timestamp).toDate(),
        } as Order)
    );
    callback(orders);
  });
};

export const subscribeToMenuItems = (
  restaurantId: string,
  callback: (items: MenuItem[]) => void
) => {
  const menuItemsRef = getMenuItemsRef(restaurantId);

  return onSnapshot(menuItemsRef, (snapshot) => {
    const items = snapshot.docs.map(
      (doc) =>
        ({
          id: parseInt(doc.id),
          ...doc.data(),
          price:
            typeof doc.data().price === "string"
              ? parseFloat(doc.data().price)
              : doc.data().price,
        } as MenuItem)
    );
    callback(items);
  });
};

// Tables Management
export const getTablesFromDB = async (
  restaurantId: string
): Promise<Table[]> => {
  const tablesRef = getTablesRef(restaurantId);
  const snapshot = await getDocs(tablesRef);
  return snapshot.docs.map(
    (doc) =>
      ({
        id: doc.id,
        ...doc.data(),
      } as Table)
  );
};

export const addTableToDB = async (
  restaurantId: string,
  tableNumber: number
): Promise<string> => {
  const tablesRef = getTablesRef(restaurantId);
  const docRef = await addDoc(tablesRef, {
    number: tableNumber,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
};

export const getTableByNumber = async (
  restaurantId: string,
  tableNumber: number
): Promise<Table | null> => {
  const tablesRef = getTablesRef(restaurantId);
  const q = query(tablesRef, where("number", "==", tableNumber));
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() } as Table;
};

export const deleteTableFromDB = async (
  restaurantId: string,
  tableId: string
): Promise<void> => {
  const tableRef = doc(getTablesRef(restaurantId), tableId);
  await deleteDoc(tableRef);
};

export const validateQrCode = async (
  restaurantId: string,
  tableNumber: number
): Promise<{
  isValid: boolean;
  restaurantId: string;
  tableId: string;
} | null> => {
  try {
    const table = await getTableByNumber(restaurantId, tableNumber);
    if (!table) return null;

    return {
      isValid: true,
      restaurantId,
      tableId: table.id,
    };
  } catch (error) {
    console.error("Error validating QR code:", error);
    return null;
  }
};
