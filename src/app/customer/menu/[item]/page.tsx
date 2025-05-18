// // src/app/menu/[item]/page.tsx
// "use client";

// import { useState, useEffect } from "react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Button } from "@/components/ui/Button";
// import { Card, CardContent } from "@/components/ui/Card";
// import { Badge } from "@/components/ui/Badge";
// import { MenuItem } from "@/lib/utils/store";
// import { MenuProvider, useMenu } from "@/components/providers/MenuProvider";

// interface CartItem {
//   id: string;
//   quantity: number;
//   selectedOptions?: string[];
//   selectedSize?: string;
//   specialInstructions?: string;
//   name: string;
//   price: number;
//   basePrice: number;
// }

// interface MenuItemExtended extends MenuItem {
//   options: Array<{
//     id: string;
//     name: string;
//     price: number;
//   }>;
//   sizes: Array<{
//     id: string;
//     name: string;
//     price: number;
//   }>;
// }

// function MenuItemDetail({ itemId }: { itemId: string }) {
//   const { items } = useMenu();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const tableId = searchParams.get("table");
//   const restaurantId = searchParams.get("restaurant");
//   const [item, setItem] = useState<MenuItemExtended | null>(null);
//   const [quantity, setQuantity] = useState(1);
//   const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
//   const [selectedSize, setSelectedSize] = useState<string>("regular");
//   const [specialInstructions, setSpecialInstructions] = useState("");

//   useEffect(() => {
//     // Get menu item from Firebase-loaded items
//     const menuItem = items.find((i) => i.id === itemId);
//     if (!menuItem) {
//       router.push(`/customer/menu?restaurant=${restaurantId}&table=${tableId}`);
//       return;
//     }

//     // Add default options and sizes
//     const extendedMenuItem: MenuItemExtended = {
//       ...menuItem,
//       options: [
//         { id: "bacon", name: "Add Bacon", price: 2.0 },
//         { id: "extra-cheese", name: "Extra Cheese", price: 1.0 },
//         { id: "fried-egg", name: "Add Fried Egg", price: 1.5 },
//         { id: "avocado", name: "Add Avocado", price: 2.0 },
//       ],
//       sizes: [
//         { id: "regular", name: "Regular", price: 0 },
//         { id: "large", name: "Large", price: 3.0 },
//       ],
//     };
//     setItem(extendedMenuItem);

//     // Load existing cart item if it exists
//     const savedCart = localStorage.getItem("cartItems");
//     if (savedCart) {
//       try {
//         const cart = JSON.parse(savedCart);
//         const existingItem = cart.find((i: CartItem) => i.id === itemId);
//         if (existingItem) {
//           setQuantity(existingItem.quantity);
//           setSelectedOptions(existingItem.selectedOptions || []);
//           setSelectedSize(existingItem.selectedSize || "regular");
//           setSpecialInstructions(existingItem.specialInstructions || "");
//         }
//       } catch (error) {
//         console.error("Failed to parse cart from localStorage:", error);
//       }
//     }
//   }, [itemId, items, router, restaurantId, tableId]);

//   const handleToggleOption = (optionId: string) => {
//     setSelectedOptions((prev) =>
//       prev.includes(optionId)
//         ? prev.filter((id) => id !== optionId)
//         : [...prev, optionId]
//     );
//   };
//   const calculateTotal = () => {
//     if (!item) return 0;
//     const basePrice = item.price;
//     const sizePrice = item.sizes.find((s) => s.id === selectedSize)?.price || 0;
//     const optionsTotal = selectedOptions.reduce((sum, optionId) => {
//       const option = item.options.find((o) => o.id === optionId);
//       return sum + (option?.price || 0);
//     }, 0);

//     return (basePrice + sizePrice + optionsTotal) * quantity;
//   };

//   const handleAddToCart = () => {
//     const cartItem: CartItem = {
//       id: itemId,
//       quantity,
//       selectedOptions,
//       selectedSize,
//       specialInstructions,
//       name: item?.name || "",
//       price: calculateTotal() / quantity, // Store unit price
//       basePrice: item?.price || 0,
//     };

//     try {
//       const existingCart = JSON.parse(
//         localStorage.getItem("cartItems") || "[]"
//       ) as CartItem[];
//       const existingItemIndex = existingCart.findIndex(
//         (i) =>
//           i.id === itemId &&
//           i.selectedOptions?.toString() === selectedOptions.toString() &&
//           i.selectedSize === selectedSize
//       );

//       if (existingItemIndex >= 0) {
//         existingCart[existingItemIndex].quantity += quantity;
//       } else {
//         existingCart.push(cartItem);
//       }

//       localStorage.setItem("cartItems", JSON.stringify(existingCart));
//     } catch (error) {
//       console.error("Failed to update cart:", error);
//     }

//     router.push(`/customer/menu?restaurant=${restaurantId}&table=${tableId}`);
//   };

//   if (!item) {
//     return (
//       <div className="max-w-2xl mx-auto px-4 py-8">
//         <Card>
//           <CardContent className="p-6 text-center">
//             <p className="text-gray-600">Item not found</p>
//             <Button
//               variant="outline"
//               className="mt-4"
//               onClick={() =>
//                 router.push(
//                   `/customer/menu?restaurant=${restaurantId}&table=${tableId}`
//                 )
//               }
//             >
//               Return to Menu
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-2xl mx-auto px-4 py-8">
//       <Button
//         variant="outline"
//         className="mb-6"
//         onClick={() =>
//           router.push(
//             `/customer/menu?restaurant=${restaurantId}&table=${tableId}`
//           )
//         }
//       >
//         ← Back to Menu
//       </Button>

//       <Card>
//         <CardContent className="p-6">
//           <div className="mb-6">
//             <h1 className="text-2xl font-bold text-gray-900 mb-2">
//               {item.name}
//             </h1>
//             <p className="text-gray-600">{item.description}</p>
//             {item.tags.length > 0 && (
//               <div className="flex flex-wrap gap-1 mt-2">
//                 {item.tags.map((tag) => (
//                   <Badge
//                     key={tag}
//                     variant={
//                       tag.toLowerCase() === "vegetarian"
//                         ? "success"
//                         : tag.toLowerCase() === "spicy"
//                         ? "danger"
//                         : tag.toLowerCase() === "popular"
//                         ? "primary"
//                         : "default"
//                     }
//                   >
//                     {tag}
//                   </Badge>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Size Selection */}
//           <div className="mb-6">
//             <h3 className="font-medium text-gray-900 mb-3">Size</h3>
//             <div className="flex gap-3">
//               {item.sizes.map((size) => (
//                 <button
//                   key={size.id}
//                   onClick={() => setSelectedSize(size.id)}
//                   className={`px-4 py-2 rounded-full border ${
//                     selectedSize === size.id
//                       ? "border-primary-600 bg-primary-50 text-primary-700"
//                       : "border-gray-300 hover:border-gray-400"
//                   }`}
//                 >
//                   {size.name}
//                   {size.price > 0 && ` (+$${size.price.toFixed(2)})`}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Options */}
//           <div className="mb-6">
//             <h3 className="font-medium text-gray-900 mb-3">Customize</h3>
//             <div className="space-y-2">
//               {item.options.map((option) => (
//                 <button
//                   key={option.id}
//                   onClick={() => handleToggleOption(option.id)}
//                   className={`w-full px-4 py-3 rounded-lg border text-left flex justify-between items-center ${
//                     selectedOptions.includes(option.id)
//                       ? "border-primary-600 bg-primary-50 text-primary-700"
//                       : "border-gray-300 hover:border-gray-400"
//                   }`}
//                 >
//                   <span>{option.name}</span>
//                   <span>{`+$${option.price.toFixed(2)}`}</span>
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* Special Instructions */}
//           <div className="mb-6">
//             <h3 className="font-medium text-gray-900 mb-3">
//               Special Instructions
//             </h3>
//             <textarea
//               value={specialInstructions}
//               onChange={(e) => setSpecialInstructions(e.target.value)}
//               placeholder="Add any special requests..."
//               className="w-full px-3 py-2 border border-gray-300 rounded-md"
//               rows={2}
//             />
//           </div>

//           {/* Quantity and Add to Cart */}
//           <div className="flex items-center justify-between pt-6 border-t">
//             <div className="flex items-center gap-3">
//               <button
//                 onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
//                 className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
//               >
//                 -
//               </button>
//               <span className="text-lg font-medium">{quantity}</span>
//               <button
//                 onClick={() => setQuantity((prev) => prev + 1)}
//                 className="w-10 h-10 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
//               >
//                 +
//               </button>
//             </div>

//             <Button variant="primary" onClick={handleAddToCart}>
//               Add to Cart - ${calculateTotal().toFixed(2)}
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

// export default function MenuItemDetailPage({
//   params,
//   searchParams,
// }: {
//   params: { item: string };
//   searchParams: { [key: string]: string | string[] | undefined };
// }) {
//   const router = useRouter();
//   const restaurantId =
//     (typeof searchParams.restaurant === "string"
//       ? searchParams.restaurant
//       : process.env.NEXT_PUBLIC_DEFAULT_RESTAURANT_ID) || "";
//   const itemId = params.item;

//   if (!itemId) {
//     return (
//       <div className="max-w-2xl mx-auto px-4 py-8">
//         <Card>
//           <CardContent className="p-6 text-center">
//             <p className="text-gray-600">Invalid item ID</p>
//             <Button
//               variant="outline"
//               className="mt-4"
//               onClick={() => router.push("/customer/menu")}
//             >
//               Return to Menu
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <MenuProvider restaurantId={restaurantId}>
//       <MenuItemDetail itemId={itemId} />
//     </MenuProvider>
//   );
// }
