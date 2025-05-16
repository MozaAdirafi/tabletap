import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { MenuItem, MenuCategory, Order } from '../utils/store';

// Menu Items
export const getMenuItemsFromDB = async (): Promise<MenuItem[]> => {
  const menuItemsRef = collection(db, 'menuItems');
  const snapshot = await getDocs(menuItemsRef);
  return snapshot.docs.map(doc => ({ id: parseInt(doc.id), ...doc.data() } as MenuItem));
};

export const addMenuItemToDB = async (item: Omit<MenuItem, 'id'>): Promise<MenuItem> => {
  const menuItemsRef = collection(db, 'menuItems');
  const docRef = await addDoc(menuItemsRef, {
    ...item,
    createdAt: serverTimestamp(),
  });
  return { ...item, id: parseInt(docRef.id) };
};

export const updateMenuItemInDB = async (item: MenuItem): Promise<void> => {
  const menuItemRef = doc(db, 'menuItems', item.id.toString());
  await updateDoc(menuItemRef, {
    ...item,
    updatedAt: serverTimestamp(),
  });
};

export const deleteMenuItemFromDB = async (id: number): Promise<void> => {
  const menuItemRef = doc(db, 'menuItems', id.toString());
  await deleteDoc(menuItemRef);
};

// Categories
export const getMenuCategoriesFromDB = async (): Promise<MenuCategory[]> => {
  const categoriesRef = collection(db, 'menuCategories');
  const snapshot = await getDocs(categoriesRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MenuCategory));
};

export const addMenuCategoryToDB = async (category: MenuCategory): Promise<void> => {
  const categoriesRef = collection(db, 'menuCategories');
  await addDoc(categoriesRef, {
    ...category,
    createdAt: serverTimestamp(),
  });
};

export const updateMenuCategoryInDB = async (category: MenuCategory): Promise<void> => {
  const categoryRef = doc(db, 'menuCategories', category.id);
  await updateDoc(categoryRef, {
    ...category,
    updatedAt: serverTimestamp(),
  });
};

export const deleteMenuCategoryFromDB = async (id: string): Promise<void> => {
  const categoryRef = doc(db, 'menuCategories', id);
  await deleteDoc(categoryRef);
};

// Orders
export const getOrdersFromDB = async (): Promise<Order[]> => {
  const ordersRef = collection(db, 'orders');
  const q = query(ordersRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: parseInt(doc.id),
    createdAt: doc.data().createdAt?.toDate(),
  } as Order));
};

export const addOrderToDB = async (order: Omit<Order, 'id'>): Promise<Order> => {
  const ordersRef = collection(db, 'orders');
  const docRef = await addDoc(ordersRef, {
    ...order,
    createdAt: serverTimestamp(),
    status: 'pending',
  });
  return { ...order, id: parseInt(docRef.id) } as Order;
};

export const updateOrderStatusInDB = async (orderId: number, status: Order['status']): Promise<void> => {
  const orderRef = doc(db, 'orders', orderId.toString());
  await updateDoc(orderRef, {
    status,
    updatedAt: serverTimestamp(),
  });
};

export const getOrderByIdFromDB = async (id: number): Promise<Order | null> => {
  const orderRef = doc(db, 'orders', id.toString());
  const orderDoc = await getDoc(orderRef);
  if (!orderDoc.exists()) return null;
  
  return {
    ...orderDoc.data(),
    id: parseInt(orderDoc.id),
    createdAt: orderDoc.data().createdAt?.toDate(),
  } as Order;
};

export const getOrdersByTableFromDB = async (tableId: string): Promise<Order[]> => {
  const ordersRef = collection(db, 'orders');
  const q = query(
    ordersRef,
    where('tableId', '==', tableId),
    orderBy('createdAt', 'desc')
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    ...doc.data(),
    id: parseInt(doc.id),
    createdAt: doc.data().createdAt?.toDate(),
  } as Order));
};
