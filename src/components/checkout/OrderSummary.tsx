// src/components/checkout/OrderSummary.tsx


type Option = {
  id: string;
  name: string;
  price: number;
};

interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
  selectedOptions?: string[];
  selectedSize?: string;
  specialInstructions?: string;
  options?: Option[];
}

interface OrderSummaryProps {
  items: OrderItem[];
}

export function OrderSummary({ items }: OrderSummaryProps) {
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const tax = calculateSubtotal() * 0.1; // 10% tax
  const total = calculateSubtotal() + tax;

  return (
    <div>
      {/* Order Items */}
      <div className="space-y-4 mb-6">
        {items.map((item, index) => (
          <div key={index} className="flex justify-between">
            <div>
              <span className="font-medium">{item.quantity}x </span>
              {item.name}
              {item.selectedSize && item.selectedSize !== "regular" && (
                <span className="text-sm text-gray-600">
                  {" "}
                  - {item.selectedSize}
                </span>
              )}
              {item.selectedOptions && item.selectedOptions.length > 0 && (
                <div className="text-sm text-gray-600 ml-6">
                  {item.selectedOptions.join(", ")}
                </div>
              )}
              {item.specialInstructions && (
                <div className="text-sm text-gray-500 ml-6 italic">
                  Note: {item.specialInstructions}
                </div>
              )}
            </div>
            <span className="text-gray-900">
              ${(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
        ))}
      </div>

      {/* Order Summary */}
      <div className="border-t pt-4 space-y-2">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal</span>
          <span>${calculateSubtotal().toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Tax (10%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
          <span>Total</span>
          <span>${total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
