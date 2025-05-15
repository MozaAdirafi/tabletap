// src/app/checkout/page.tsx (continued)
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { Skeleton } from '@/components/ui/Skeleton';


export default function CheckoutPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [orderItems] = useState([
    {
      id: 1,
      name: 'Classic Cheeseburger',
      price: 12.99,
      quantity: 1,
    },
    {
      id: 5,
      name: 'French Fries',
      price: 4.99,
      quantity: 1,
      options: [
        { name: 'Extra Cheese', price: 1.50 },
      ],
    },
    {
      id: 10,
      name: 'Soft Drink',
      price: 2.49,
      quantity: 2,
      specialInstructions: 'No ice please',
    },
  ]);
  
  const [tipPercentage, setTipPercentage] = useState(15);
  const [customTip, setCustomTip] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [specialRequests, setSpecialRequests] = useState('');
  
  // Calculate order totals
  const subtotal = orderItems.reduce((acc, item) => {
    const itemTotal = item.price * item.quantity;
    const optionsTotal = item.options?.reduce((sum, option) => sum + option.price, 0) || 0;
    return acc + itemTotal + optionsTotal;
  }, 0);
  
  const tax = subtotal * 0.07; // 7% tax rate
  
  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const handlePlaceOrder = () => {
    console.log('Placing order...');
    // Here you would typically send the order to your backend
    
    // Simulate loading and redirect to confirmation
    setIsLoading(true);
    setTimeout(() => {
      window.location.href = '/confirmation';
    }, 2000);
  };
  
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        <p className="text-gray-600">Review your order and complete your purchase</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Order Summary */}
        <div>
          {isLoading ? (
            <Card>
              <CardHeader className="border-b">
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="pt-4">
                <Skeleton className="h-32 w-full mb-4" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <OrderSummary 
              items={orderItems}
              tableNumber={5}
              subtotal={subtotal}
              tax={tax}
              tipOptions={[10, 15, 20]}
              tipPercentage={tipPercentage}
              customTip={customTip}
              onUpdateTip={setTipPercentage}
              onUpdateCustomTip={setCustomTip}
            />
          )}
        </div>
        
        {/* Payment and Additional Info */}
        <div>
          <Card>
            <CardHeader className="border-b">
              <h2 className="text-lg font-semibold">Payment & Additional Information</h2>
            </CardHeader>
            
            <CardContent className="space-y-6 pt-4">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-32 w-full" />
                </div>
              ) : (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Payment Method</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          id="payment-cash"
                          name="payment-method"
                          type="radio"
                          checked={paymentMethod === 'cash'}
                          onChange={() => setPaymentMethod('cash')}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <label htmlFor="payment-cash" className="ml-2 block text-sm text-gray-700">
                          Pay with Cash
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="payment-card"
                          name="payment-method"
                          type="radio"
                          checked={paymentMethod === 'card'}
                          onChange={() => setPaymentMethod('card')}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <label htmlFor="payment-card" className="ml-2 block text-sm text-gray-700">
                          Pay with Card (at the table)
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="payment-mobile"
                          name="payment-method"
                          type="radio"
                          checked={paymentMethod === 'mobile'}
                          onChange={() => setPaymentMethod('mobile')}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <label htmlFor="payment-mobile" className="ml-2 block text-sm text-gray-700">
                          Mobile Payment
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Special Requests</h3>
                    <textarea
                      rows={3}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Any allergies or special instructions for the kitchen?"
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                    />
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Dietary Preferences</h3>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <input
                          id="allergy-gluten"
                          name="allergy-gluten"
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="allergy-gluten" className="ml-2 block text-sm text-gray-700">
                          Gluten Intolerance
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="allergy-nuts"
                          name="allergy-nuts"
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="allergy-nuts" className="ml-2 block text-sm text-gray-700">
                          Nut Allergy
                        </label>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="allergy-dairy"
                          name="allergy-dairy"
                          type="checkbox"
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="allergy-dairy" className="ml-2 block text-sm text-gray-700">
                          Dairy Allergy
                        </label>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
            
            <CardFooter className="border-t flex justify-end">
              {!isLoading && (
                <>
                  <Button
                    variant="outline"
                    className="mr-2"
                    onClick={() => window.history.back()}
                  >
                    Back to Menu
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handlePlaceOrder}
                    isLoading={isLoading}
                  >
                    Place Order
                  </Button>
                </>
              )}
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}