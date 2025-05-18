// src/lib/firebase/restaurant.ts
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

// Get a reference to the restaurant document
const getRestaurantRef = (restaurantId: string) => {
  // Replace any + with - in the restaurantId to match Firebase Auth UIDs
  const encodedId = restaurantId.replace(/\+/g, "-");
  return doc(db, "restaurants", encodedId);
};

// Get restaurant details by ID
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
