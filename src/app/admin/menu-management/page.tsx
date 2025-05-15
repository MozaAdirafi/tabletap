// src/app/admin/menu-management/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { EmptyState } from '@/components/shared/EmptyState';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  categoryId: string;
  imageSrc?: string;
  tags: string[];
  available: boolean;
}

interface MenuCategory {
  id: string;
  name: string;
}

export default function MenuManagementPage() {
  // In a real app, you would fetch this data from an API
  const [categories, setCategories] = useState<MenuCategory[]>([
    { id: 'appetizers', name: 'Appetizers' },
    { id: 'main-courses', name: 'Main Courses' },
    { id: 'desserts', name: 'Desserts' },
    { id: 'beverages', name: 'Beverages' },
    { id: 'sides', name: 'Sides' },
  ]);
  
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    {
      id: 1,
      name: 'Mozzarella Sticks',
      description: 'Crispy breaded mozzarella sticks served with marinara sauce.',
      price: 7.99,
      categoryId: 'appetizers',
      tags: ['Popular', 'Vegetarian'],
      available: true,
    },
    {
      id: 2,
      name: 'Loaded Potato Skins',
      description: 'Crispy potato skins loaded with cheese, bacon, and green onions, served with sour cream.',
      price: 9.49,
      categoryId: 'appetizers',
      tags: ['Spicy'],
      available: true,
    },
    {
      id: 3,
      name: 'Spinach Artichoke Dip',
      description: 'Creamy spinach and artichoke dip served with tortilla chips.',
      price: 8.99,
      categoryId: 'appetizers',
      tags: ['Vegetarian'],
      available: true,
    },
    {
      id: 4,
      name: 'Classic Cheeseburger',
      description: 'Juicy beef patty with cheddar cheese, lettuce, tomato, and our special sauce on a brioche bun.',
      price: 12.99,
      categoryId: 'main-courses',
      tags: ['Popular'],
      available: true,
    },
    {
      id: 5,
      name: 'Margherita Pizza',
      description: 'Traditional pizza with tomato sauce, fresh mozzarella, and basil on our hand-tossed crust.',
      price: 14.99,
      categoryId: 'main-courses',
      tags: ['Vegetarian'],
      available: true,
    },
    {
      id: 6,
      name: 'Chocolate Brownie',
      description: 'Rich, fudgy brownie served warm with vanilla ice cream and chocolate sauce.',
      price: 6.99,
      categoryId: 'desserts',
      tags: ['Popular'],
      available: true,
    },
    {
      id: 7,
      name: 'Soft Drink',
      description: 'Coca-Cola, Diet Coke, Sprite, or Fanta.',
      price: 2.49,
      categoryId: 'beverages',
      tags: [],
      available: true,
    },
  ]);
  
  const [activeCategory, setActiveCategory] = useState('appetizers');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(false); // For simulating API calls
  
  const filteredItems = menuItems.filter(item => item.categoryId === activeCategory);
  
  // Handler for adding a new category
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    
    // Generate a simple ID from the name
    const newId = newCategoryName.toLowerCase().replace(/\s+/g, '-');
    
    // Check if the ID already exists
    if (categories.some(cat => cat.id === newId)) {
      alert('A category with a similar name already exists!');
      return;
    }
    
    const newCategory = {
      id: newId,
      name: newCategoryName
    };
    
    setCategories([...categories, newCategory]);
    setNewCategoryName('');
    setIsAddingCategory(false);
    setActiveCategory(newId);
  };
  
  // Handler for deleting an item
  const handleDeleteItem = (itemId: number) => {
    if (confirm('Are you sure you want to delete this item?')) {
      setMenuItems(menuItems.filter(item => item.id !== itemId));
    }
  };
  
  // Handler for toggling item availability
  const handleToggleAvailability = (itemId: number) => {
    setMenuItems(
      menuItems.map(item => 
        item.id === itemId 
          ? { ...item, available: !item.available } 
          : item
      )
    );
  };
  
  // New item form data
  const [newItem, setNewItem] = useState<Omit<MenuItem, 'id'>>({
    name: '',
    description: '',
    price: 0,
    categoryId: activeCategory,
    tags: [],
    available: true,
  });
  
  // Handler for adding a new item
  const handleAddItem = () => {
    if (!newItem.name || !newItem.description || newItem.price <= 0) {
      alert('Please fill in all required fields!');
      return;
    }
    
    const newId = Math.max(0, ...menuItems.map(item => item.id)) + 1;
    
    const itemToAdd = {
      ...newItem,
      id: newId,
      categoryId: activeCategory,
    };
    
    setMenuItems([...menuItems, itemToAdd]);
    setNewItem({
      name: '',
      description: '',
      price: 0,
      categoryId: activeCategory,
      tags: [],
      available: true,
    });
    setIsAddingItem(false);
  };
  
  // Handler for updating an item
  const handleUpdateItem = () => {
    if (!editingItem || !editingItem.name || !editingItem.description || editingItem.price <= 0) {
      alert('Please fill in all required fields!');
      return;
    }
    
    setMenuItems(
      menuItems.map(item => 
        item.id === editingItem.id ? editingItem : item
      )
    );
    setEditingItem(null);
  };
  
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Menu Management</h1>
          <p className="text-gray-500 mt-1">Manage your restaurant's menu items and categories</p>
        </div>
        <Button 
          variant="primary"
          onClick={() => setIsAddingItem(true)}
          disabled={isAddingItem || !!editingItem}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
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
                className={`px-4 py-2 rounded-md whitespace-nowrap text-sm font-medium ${
                  activeCategory === category.id
                    ? 'bg-primary-100 text-primary-800 border border-primary-200'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-transparent'
                }`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.name}
              </button>
            ))}
            {!isAddingCategory ? (
              <button
                className="px-4 py-2 rounded-md whitespace-nowrap text-sm font-medium border border-dashed border-gray-300 text-gray-600 hover:bg-gray-50"
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
                    setNewCategoryName('');
                  }}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* New Item Form or Edit Item Form */}
      {(isAddingItem || editingItem) && (
        <Card>
          <CardHeader className="border-b">
            <h2 className="text-lg font-semibold">
              {isAddingItem ? 'Add New Menu Item' : 'Edit Menu Item'}
            </h2>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Item Name*
                </label>
                <Input
                  id="name"
                  placeholder="e.g. Classic Cheeseburger"
                  value={isAddingItem ? newItem.name : editingItem?.name || ''}
                  onChange={(e) => {
                    if (isAddingItem) {
                      setNewItem({ ...newItem, name: e.target.value });
                    } else if (editingItem) {
                      setEditingItem({ ...editingItem, name: e.target.value });
                    }
                  }}
                  required
                  fullWidth
                />
              </div>
              
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                  Price* ($)
                </label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="e.g. 9.99"
                  value={isAddingItem ? newItem.price || '' : editingItem?.price || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    if (isAddingItem) {
                      setNewItem({ ...newItem, price: isNaN(value) ? 0 : value });
                    } else if (editingItem) {
                      setEditingItem({ ...editingItem, price: isNaN(value) ? 0 : value });
                    }
                  }}
                  required
                  fullWidth
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description*
              </label>
              <textarea
                id="description"
                rows={3}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Describe your menu item..."
                value={isAddingItem ? newItem.description : editingItem?.description || ''}
                onChange={(e) => {
                  if (isAddingItem) {
                    setNewItem({ ...newItem, description: e.target.value });
                  } else if (editingItem) {
                    setEditingItem({ ...editingItem, description: e.target.value });
                  }
                }}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {(isAddingItem ? newItem.tags : editingItem?.tags || []).map((tag, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="flex items-center"
                  >
                    {tag}
                    <button
                      type="button"
                      className="ml-1 text-secondary-800 hover:text-secondary-900"
                      onClick={() => {
                        if (isAddingItem) {
                          setNewItem({
                            ...newItem,
                            tags: newItem.tags.filter((_, i) => i !== index)
                          });
                        } else if (editingItem) {
                          setEditingItem({
                            ...editingItem,
                            tags: editingItem.tags.filter((_, i) => i !== index)
                          });
                        }
                      }}
                    >
                      &times;
                    </button>
                  </Badge>
                ))}
              </div>
              
              <div className="flex">
                <Input
                  placeholder="Add tag (e.g., Vegetarian, Spicy, etc.)"
                  className="rounded-r-none"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.target as HTMLInputElement;
                      const tag = input.value.trim();
                      if (tag) {
                        if (isAddingItem) {
                          setNewItem({
                            ...newItem,
                            tags: [...newItem.tags, tag]
                          });
                        } else if (editingItem) {
                          setEditingItem({
                            ...editingItem,
                            tags: [...editingItem.tags, tag]
                          });
                        }
                        input.value = '';
                      }
                    }
                  }}
                />
                <Button
                  variant="secondary"
                  className="rounded-l-none"
                  onClick={(e) => {
                    const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                    const tag = input.value.trim();
                    if (tag) {
                      if (isAddingItem) {
                        setNewItem({
                          ...newItem,
                          tags: [...newItem.tags, tag]
                        });
                      } else if (editingItem) {
                        setEditingItem({
                          ...editingItem,
                          tags: [...editingItem.tags, tag]
                        });
                      }
                      input.value = '';
                    }
                  }}
                >
                  Add
                </Button>
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                id="available"
                type="checkbox"
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                checked={isAddingItem ? newItem.available : editingItem?.available || false}
                onChange={() => {
                  if (isAddingItem) {
                    setNewItem({ ...newItem, available: !newItem.available });
                  } else if (editingItem) {
                    setEditingItem({ ...editingItem, available: !editingItem.available });
                  }
                }}
              />
              <label htmlFor="available" className="ml-2 block text-sm text-gray-700">
                Item is available for ordering
              </label>
            </div>
          </CardContent>
          <CardFooter className="border-t flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setIsAddingItem(false);
                setEditingItem(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={isAddingItem ? handleAddItem : handleUpdateItem}
              isLoading={isLoading}
            >
              {isAddingItem ? 'Add Item' : 'Update Item'}
            </Button>
          </CardFooter>
        </Card>
      )}
      
      {/* Menu Items Grid */}
      {!isAddingItem && !editingItem && (
        <>
          {filteredItems.length === 0 ? (
            <EmptyState
              title={`No items in "${categories.find(c => c.id === activeCategory)?.name}"`}
              description="Add your first menu item to this category."
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
              }
              action={{
                label: 'Add Item',
                onClick: () => setIsAddingItem(true),
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <Card key={item.id} className="h-full hover:shadow-md transition-shadow">
                  <div className="h-40 bg-gray-200 relative">
                    {item.imageSrc ? (
                      <img
                        src={item.imageSrc}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    
                    <div className="absolute top-2 right-2">
                      <Badge
                        variant={item.available ? 'success' : 'danger'}
                      >
                        {item.available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-gray-900 text-lg truncate mr-2">{item.name}</h3>
                      <span className="font-medium text-gray-900">${item.price.toFixed(2)}</span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                    
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.tags.map((tag, index) => (
                          <Badge
                            key={index}
                            variant={
                              tag.toLowerCase() === 'vegetarian' ? 'success' :
                              tag.toLowerCase() === 'spicy' ? 'danger' :
                              tag.toLowerCase() === 'popular' ? 'primary' :
                              'default'
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
                        variant={item.available ? 'warning' : 'success'}
                        size="sm"
                        className="flex-1"
                        onClick={() => handleToggleAvailability(item.id)}
                      >
                        {item.available ? 'Mark Unavailable' : 'Mark Available'}
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteItem(item.id)}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Add New Item Card */}
              <Card 
                className="h-full bg-gray-50 border-2 border-dashed border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer flex items-center justify-center"
                onClick={() => setIsAddingItem(true)}
              >
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                  <h3 className="font-medium text-gray-700">Add New Item</h3>
                  <p className="text-gray-500 text-sm mt-1">Click to add a new menu item</p>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}