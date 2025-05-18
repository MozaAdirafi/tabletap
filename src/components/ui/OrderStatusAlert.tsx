import { Order } from "@/lib/utils/store";
import { Alert } from "./Alert";

interface OrderStatusAlertProps {
  status: Order["status"];
}

export function OrderStatusAlert({ status }: OrderStatusAlertProps) {
  // Add a specific return type to inform TypeScript about the variant values
  const getStatusMessage = (status: Order["status"]): {
    title: string;
    message: string;
    variant: "info" | "success" | "error" | "warning";
  } => {
    switch (status) {
      case "pending":
        return {
          title: "Order Received",
          message:
            "Your order has been received and is waiting to be prepared.",
          variant: "info",
        };
      case "preparing":
        return {
          title: "Order Being Prepared",
          message: "Our kitchen is now preparing your delicious meal!",
          variant: "info",
        };
      case "ready":
        return {
          title: "Order Ready for Pickup",
          message: "Your order is ready! Please collect it from the counter.",
          variant: "success",
        };
      case "delivered":
        return {
          title: "Order Delivered",
          message: "Your order has been delivered. Enjoy your meal!",
          variant: "success",
        };
      case "cancelled":
        return {
          title: "Order Cancelled",
          message:
            "Unfortunately, your order has been cancelled. Please contact staff for assistance.",
          variant: "error",
        };
      default:
        return {
          title: "Order Status",
          message: "Tracking your order...",
          variant: "info",
        };
    }
  };

  const { title, message, variant } = getStatusMessage(status);

  return (
    <Alert variant={variant}>
      <div className="font-medium">{title}</div>
      <div className="text-sm">{message}</div>
    </Alert>
  );
}