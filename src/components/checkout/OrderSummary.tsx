// src/components/checkout/OrderSummary.tsx
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/Card';

interface OrderItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
  options?: {
    name: string;
    price: number;
  }[];
  specialInstructions?: string;
}

interface OrderSummaryProps {
  items: OrderItem[];
  tableNumber: string | number;
  subtotal: number;
  tax: number;
  tipOptions?: number[];
  onPlaceOrder?: () => void;
  onUpdateTip?: (tipPercentage: number) => void;
  tipPercentage?: number;
  customTip?: number;
  onUpdateCustomTip?: (amount: number) => void;
  isLoading?: boolean;
}

export function OrderSummary({
  items,
  tableNumber,
  subtotal,
  tax,
  tipOptions = [10, 15, 20],
  onPlaceOrder,
  onUpdateTip,
  tipPercentage,
  customTip,
  onUpdateCustomTip,
  isLoading = false,
}: OrderSummaryProps) {
  const tipAmount = tipPercentage ? (subtotal * tipPercentage) / 100 : customTip || 0;
  const total = subtotal + tax + tipAmount;

  return (
    <Card>
      <CardHeader className="border-b">
        <h3 className="text-lg font-semibold">Order Summary</h3>
        <p className="text-sm text-gray-500">Table {tableNumber}</p>
      </CardHeader>
      
      <CardContent className="pt-4">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <div>
                <div className="flex items-center">
                  <span className="font-medium text-gray-900">{item.quantity}x</span>
                  <span className="ml-2 text-gray-900">{item.name}</span>
                </div>
                
                {item.options && item.options.length > 0 && (
                  <ul className="text-xs text-gray-500 ml-6 mt-1">
                    {item.options.map((option, idx) => (
                      <li key={idx}>
                        + {option.name} (${option.price.toFixed(2)})
                      </li>
                    ))}
                  </ul>
                )}
                
                {item.specialInstructions && (
                  <p className="text-xs text-gray-500 ml-6 mt-1 italic">
                    "{item.specialInstructions}"
                  </p>
                )}
              </div>
              
              <div className="text-gray-900">
                ${((item.price * item.quantity) + 
                  (item.options?.reduce((acc, curr) => acc + curr.price, 0) || 0)
                ).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">${subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Tax</span>
            <span className="text-gray-900">${tax.toFixed(2)}</span>
          </div>
          
          {(tipPercentage || customTip) && (
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Tip</span>
              <span className="text-gray-900">${tipAmount.toFixed(2)}</span>
            </div>
          )}
          
          <div className="flex justify-between mt-4 pt-4 border-t border-gray-200">
            <span className="font-semibold text-gray-900">Total</span>
            <span className="font-semibold text-gray-900">${total.toFixed(2)}</span>
          </div>
        </div>
        
        {onUpdateTip && (
          <div className="mt-6">
            <p className="text-sm font-medium text-gray-700 mb-2">Add a tip:</p>
            <div className="flex space-x-2 mb-2">
              {tipOptions.map((tip) => (
                <button
                  key={tip}
                  type="button"
                  className={`flex-1 py-2 text-sm border rounded-md ${
                    tipPercentage === tip
                      ? 'bg-primary-50 border-primary-500 text-primary-700'
                      : 'border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    onUpdateTip(tip);
                    if (onUpdateCustomTip) onUpdateCustomTip(0);
                  }}
                >
                  {tip}%
                </button>
              ))}
              
              <button
                type="button"
                className={`flex-1 py-2 text-sm border rounded-md ${
                  !tipPercentage && customTip !== undefined
                    ? 'bg-primary-50 border-primary-500 text-primary-700'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => {
                  if (onUpdateTip) onUpdateTip(0);
                  if (onUpdateCustomTip) onUpdateCustomTip(customTip || 0);
                }}
              >
                Custom
              </button>
            </div>
            
            {!tipPercentage && onUpdateCustomTip && (
              <div className="mt-2 flex items-center">
                <span className="mr-2">$</span>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                  value={customTip || ''}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    onUpdateCustomTip(isNaN(value) ? 0 : value);
                  }}
                  placeholder="Enter custom tip amount"
                  step="0.01"
                  min="0"
                />
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      {onPlaceOrder && (
        <CardFooter className="flex justify-end border-t">
          <Button
            variant="primary"
            size="lg"
            onClick={onPlaceOrder}
            isLoading={isLoading}
          >
            Place Order
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}