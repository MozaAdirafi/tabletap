// src/app/admin/menu-management/page.tsx
"use client";

import { useState, useEffect } from "react";
import { clsx } from "clsx";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/shared/EmptyState";
import { MenuItemForm } from "@/components/admin/MenuItemForm";
import { useAuth } from "@/lib/context/AuthContext";
import Image from "next/image";
import {
  getMenuItemsFromDB,
  getMenuCategoriesFromDB,
  addMenuItemToDB,
  updateMenuItemInDB,
  deleteMenuItemFromDB,
  addMenuCategoryToDB,
  subscribeToMenuItems,
} from "@/lib/firebase/firestore";

// Placeholder image for all food items
const PLACEHOLDER_IMAGE_URL =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect width="400" height="300" fill="%23e5e7eb"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="32" fill="%239ca3af">Food Image</text></svg>';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageSrc?: string;
  image?: File;
  tags: string[];
  available: boolean;
}

interface MenuCategory {
  id: string;
  name: string;
}

export default function MenuManagementPage() {
  const { user } = useAuth();
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false);

  // Load initial data
  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        const [items, cats] = await Promise.all([
          getMenuItemsFromDB(user.uid),
          getMenuCategoriesFromDB(user.uid),
        ]);
        setMenuItems(items);
        setCategories(cats);
        if (cats.length > 0) {
          setActiveCategory(cats[0].id);
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading menu data:", error);
        setIsLoading(false);
      }
    };

    // Subscribe to real-time menu updates
    const unsubscribe = subscribeToMenuItems(user.uid, (updatedItems) => {
      setMenuItems(updatedItems);
    });

    loadData();
    return () => unsubscribe();
  }, [user]);

  const filteredItems = menuItems.filter(
    (item) => item.categoryId === activeCategory
  );

  // Handler for adding a new category
  const handleAddCategory = async () => {
    if (!user || !newCategoryName.trim()) return;

    try {
      const newCategory = {
        id: newCategoryName.toLowerCase().replace(/\s+/g, "-"),
        name: newCategoryName,
      };

      await addMenuCategoryToDB(user.uid, newCategory);
      setCategories([...categories, newCategory]);
      setNewCategoryName("");
      setIsAddingCategory(false);
      setActiveCategory(newCategory.id);
    } catch (error) {
      console.error("Error adding category:", error);
      alert("Failed to add category. Please try again.");
    }
  };
  // Handler for adding a new item
  const handleAddItem = async (data: {
    name: string;
    description: string;
    price: string | number;
    categoryId: string;
    tags: string[];
    available: boolean;
    image?: File | string;
  }) => {
    if (!user || !activeCategory || addLoading) return;
    setAddLoading(true);
    try {
      const numericPrice =
        typeof data.price === "string" ? parseFloat(data.price) : data.price;
      // Always use the selected categoryId from the form
      await addMenuItemToDB(user.uid, {
        name: data.name,
        description: data.description,
        price: numericPrice,
        categoryId: data.categoryId, // always use the form value
        tags: data.tags,
        available: data.available,
      });
      setIsAddingItem(false);
      alert("Item added successfully!");
    } catch (error) {
      console.error("Error adding menu item:", error);
      alert("Failed to add menu item. Please try again.");
    } finally {
      setAddLoading(false);
    }
  };

  // Handler for updating an item
  const handleUpdateItem = async (item: MenuItem) => {
    if (!user) return;
    if (!item.id) {
      alert("Error: Menu item is missing an ID. Cannot update.");
      return;
    }

    console.log("Updating item with ID:", item.id);

    try {
      // Ensure we have a valid item with ID
      await updateMenuItemInDB(user.uid, item);

      // Optimistically update UI
      setMenuItems((prevItems) =>
        prevItems.map((i) => (i.id === item.id ? item : i))
      );

      setEditingItem(null);
      alert("Item updated successfully!");
    } catch (error) {
      console.error("Error updating menu item:", error);
      alert("Failed to update menu item. Please try again.");
    }
  };

  // Handler for deleting an item
  const handleDeleteItem = async (itemId: string) => {
    if (!user) return;
    if (!itemId || itemId.trim() === "") {
      alert("Error: Invalid item ID. Cannot delete.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this item?")) return;

    console.log("Deleting item with ID:", itemId);

    try {
      await deleteMenuItemFromDB(user.uid, itemId);

      // Optimistically update UI
      setMenuItems((prevItems) =>
        prevItems.filter((item) => item.id !== itemId)
      );
      alert("Item deleted successfully!");
    } catch (error) {
      console.error("Error deleting menu item:", error);
      alert("Failed to delete menu item. Please try again.");
    }
  };

  // Handler for toggling item availability
  const handleToggleAvailability = async (item: MenuItem) => {
    if (!user) return;

    try {
      const updatedItem = { ...item, available: !item.available };
      await updateMenuItemInDB(user.uid, updatedItem);

      // Optimistically update UI
      setMenuItems((prevItems) =>
        prevItems.map((i) => (i.id === item.id ? updatedItem : i))
      );

      alert(
        `Item marked as ${updatedItem.available ? "available" : "unavailable"}`
      );
    } catch (error) {
      console.error("Error updating item availability:", error);
      alert("Failed to update item availability. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-500 mt-1">
            Manage your restaurant&apos;s menu items and categories
          </p>
        </div>
        <Button
          onClick={() => setIsAddingItem(true)}
          variant="primary"
          className="flex items-center gap-2"
          disabled={isAddingItem || !!editingItem}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Add Menu Item
        </Button>
      </div>

      {/* Category Navigation */}
      <Card>
        <CardContent className="py-4">
          <div className="flex overflow-x-auto space-x-2 pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                className={`px-4 py-2 rounded-md whitespace-nowrap text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? "bg-primary-100 text-primary-800 border border-primary-200"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200 border border-transparent"
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
            {!isAddingCategory ? (
              <button
                className="px-4 py-2 rounded-md whitespace-nowrap text-sm font-medium border border-dashed border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
                onClick={() => setIsAddingCategory(true)}
              >
                + Add Category
              </button>
            ) : (
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="min-w-[150px] h-9"
                  autoFocus
                />
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim()}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsAddingCategory(false);
                    setNewCategoryName("");
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Menu Items Grid */}
      {!isAddingItem && !editingItem && (
        <>
          {filteredItems.length === 0 ? (
            <EmptyState
              title={`No items in "${
                categories.find((c) => c.id === activeCategory)?.name ||
                "this category"
              }"`}
              description="Add your first menu item to this category."
              action={{
                label: "Add Item",
                onClick: () => setIsAddingItem(true),
              }}
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                  />
                </svg>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card
                  key={item.id}
                  className="h-full hover:shadow-md transition-shadow"
                >
                  {/* Image */}
                  <div className="h-40 bg-gray-200 relative">
                    <Image
                      src={item.imageSrc || PLACEHOLDER_IMAGE_URL}
                      alt={item.name}
                      width={400}
                      height={160}
                      className="w-full h-full object-cover"
                      unoptimized={
                        item.imageSrc?.startsWith("data:") ||
                        PLACEHOLDER_IMAGE_URL.startsWith("data:")
                      }
                    />
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant={item.available ? "success" : "warning"}
                        size="sm"
                      >
                        {item.available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 text-lg truncate mr-2">
                        {item.name}
                      </h3>
                      <span className="font-medium text-gray-900">
                        $
                        {typeof item.price === "number"
                          ? item.price.toFixed(2)
                          : "0.00"}
                      </span>
                    </div>

                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {item.description}
                    </p>

                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
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

                    <div className="flex space-x-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => setEditingItem(item)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className={clsx(
                          "flex-1",
                          item.available
                            ? "hover:text-red-600 hover:border-red-600"
                            : "hover:text-green-600 hover:border-green-600"
                        )}
                        onClick={() => handleToggleAvailability(item)}
                      >
                        {item.available ? "Mark Unavailable" : "Mark Available"}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <button
                className="h-full min-h-[320px] rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 transition-colors p-8 text-center flex flex-col items-center justify-center"
                onClick={() => setIsAddingItem(true)}
              >
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                </div>
                <h3 className="font-medium text-gray-700">Add New Item</h3>
                <p className="text-gray-500 text-sm mt-1">
                  Click to add a new menu item
                </p>
              </button>
            </div>
          )}
        </>
      )}

      {/* Menu Item Form Modal */}
      {(isAddingItem || editingItem) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-semibold mb-4">
              {isAddingItem ? "Add New Menu Item" : "Edit Menu Item"}
            </h2>
            <MenuItemForm
              initialData={
                editingItem || {
                  name: "",
                  description: "",
                  price: "",
                  categoryId: activeCategory,
                  tags: [],
                  available: true,
                }
              }
              categories={categories.map((cat) => ({
                value: cat.id,
                label: cat.name,
              }))}
              onSubmit={
                isAddingItem
                  ? handleAddItem
                  : (data) => {
                      console.log("handleAddItem called", data);
                      if (!editingItem || !editingItem.id) {
                        alert("Error: No menu item selected for editing.");
                        return;
                      }
                      handleUpdateItem({
                        name: data.name,
                        description: data.description,
                        id: editingItem.id,
                        categoryId: data.categoryId, // always use the form value
                        tags: data.tags,
                        available: data.available,
                        imageSrc: PLACEHOLDER_IMAGE_URL,
                        price:
                          typeof data.price === "string"
                            ? parseFloat(data.price)
                            : data.price,
                      });
                    }
              }
              onCancel={() => {
                setIsAddingItem(false);
                setEditingItem(null);
              }}
              isLoading={addLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
}
