// src/app/menu/[item]/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card} from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';


interface Option {
  id: string;
  name: string;
  price: number;
}

interface ItemSize {
  id: string;
  name: string;
  price: number;
}

export default function MenuItemDetailPage({ params }: { params: { item: string } }) {
  const router = useRouter();
  const itemId = params.item;
  
  // In a real app, you would fetch this data from your API
  const item = {
    id: itemId,
    name: 'Classic Cheeseburger',
    description: 'Juicy beef patty with cheddar cheese, lettuce, tomato, and our special sauce on a brioche bun.',
    basePrice: 12.99,
    image: '',
    tags: ['Popular'],
    options: [
      { id: 'bacon', name: 'Add Bacon', price: 2.0 },
      { id: 'extra-cheese', name: 'Extra Cheese', price: 1.0 },
      { id: 'fried-egg', name: 'Add Fried Egg', price: 1.5 },
      { id: 'avocado', name: 'Add Avocado', price: 2.0 },
    ],
    sizes: [
      { id: 'regular', name: 'Regular', price: 0 },
      { id: 'large', name: 'Large', price: 3.0 },
    ],
  };
  
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState(item.sizes[0].id);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  const handleOptionToggle = (optionId: string) => {
    if (selectedOptions.includes(optionId)) {
      setSelectedOptions(selectedOptions.filter(id => id !== optionId));
    } else {
      setSelectedOptions([...selectedOptions, optionId]);
    }
  };
  
  const getSelectedSize = (): ItemSize => {
    return item.sizes.find(size => size.id === selectedSize) || item.sizes[0];
  };
  
  const getSelectedOptions = (): Option[] => {
    return item.options.filter(option => selectedOptions.includes(option.id));
  };
  
  const calculateTotalPrice = (): number => {
    const sizePrice = getSelectedSize().price;
    const optionsPrice = getSelectedOptions().reduce((sum, option) => sum + option.price, 0);
    return (item.basePrice + sizePrice + optionsPrice) * quantity;
  };
  
  const handleAddToCart = () => {
    // In a real app, you would add this to your cart state
    console.log('Adding to cart:', {
      itemId,
      name: item.name,
      quantity,
      size: getSelectedSize(),
      options: getSelectedOptions(),
      specialInstructions,
      totalPrice: calculateTotalPrice(),
    });
    
    // Navigate back to menu
    router.push('/menu');
  };
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <button
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
        onClick={() => router.back()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Back to Menu
      </button>
      
      <Card>
        <div className="md:flex">
          <div className="md:w-1/2">
            <div className="h-64 md:h-full bg-gray-200 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          
          <div className="md:w-1/2 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{item.name}</h1>
            
            <div className="flex flex-wrap gap-1 mb-3">
              {item.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant={tag.toLowerCase() === 'vegetarian' ? 'success' : tag.toLowerCase() === 'spicy' ? 'danger' : 'default'}
                  size="sm"
                >
                  {tag}
                </Badge>
              ))}
            </div>
            
            <p className="text-gray-600 mb-6">{item.description}</p>
            
            <form className="space-y-6">
              {/* Size Selection */}
              {item.sizes.length > 1 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Size</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {item.sizes.map((size) => (
                      <div key={size.id} className="relative">
                        <input
                          id={`size-${size.id}`}
                          name="size"
                          type="radio"
                          checked={selectedSize === size.id}
                          onChange={() => setSelectedSize(size.id)}
                          className="sr-only"
                        />
                        <label
                          htmlFor={`size-${size.id}`}
                          className={`w-full p-3 border rounded-md text-center cursor-pointer ${
                            selectedSize === size.id
                              ? 'bg-primary-50 border-primary-500 text-primary-700'
                              : 'border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          {size.name}
                          {size.price > 0 && ` (+$${size.price.toFixed(2)})`}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Options Selection */}
              {item.options.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Add-Ons</h3>
                  <div className="space-y-2">
                    {item.options.map((option) => (
                      <div key={option.id} className="relative flex items-center">
                        <input
                          id={`option-${option.id}`}
                          name={`option-${option.id}`}
                          type="checkbox"
                          checked={selectedOptions.includes(option.id)}
                          onChange={() => handleOptionToggle(option.id)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`option-${option.id}`} className="ml-2 flex justify-between w-full text-sm text-gray-700">
                          <span>{option.name}</span>
                          <span>${option.price.toFixed(2)}</span>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Special Instructions */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Special Instructions</h3>
                <textarea
                  rows={3}
                  className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Any special requests?"
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                />
              </div>
              
              {/* Quantity */}
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Quantity</h3>
                <div className="flex border border-gray-300 rounded-md w-32">
                  <button
                    type="button"
                    className="px-3 py-1 border-r border-gray-300"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </button>
                  <div className="flex-1 text-center py-1">{quantity}</div>
                  <button
                    type="button"
                    className="px-3 py-1 border-l border-gray-300"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>
              
              {/* Price and Add to Cart */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-medium text-gray-900">
                    Total: ${calculateTotalPrice().toFixed(2)}
                  </span>
                  <Button
                    type="button"
                    variant="primary"
                    size="lg"
                    onClick={handleAddToCart}
                  >
                    Add to Order
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </Card>
    </div>
  );
}