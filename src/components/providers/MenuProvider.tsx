"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { subscribeToMenuItems } from "@/lib/firebase/firestore";
import type { MenuItem } from "@/lib/utils/store";

interface MenuContextType {
  items: MenuItem[];
  loading: boolean;
  error: string | null;
}

const MenuContext = createContext<MenuContextType>({
  items: [],
  loading: true,
  error: null,
});

export function MenuProvider({
  restaurantId,
  children,
}: {
  restaurantId: string;
  children: React.ReactNode;
}) {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!restaurantId) return;

    const unsubscribe = subscribeToMenuItems(restaurantId, (updatedItems) => {
      // Ensure all prices are numbers
      const processedItems = updatedItems.map((item) => ({
        ...item,
        price:
          typeof item.price === "string" ? parseFloat(item.price) : item.price,
      }));
      setItems(processedItems);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [restaurantId]);

  return (
    <MenuContext.Provider value={{ items, loading, error }}>
      {children}
    </MenuContext.Provider>
  );
}

export const useMenu = () => useContext(MenuContext);
