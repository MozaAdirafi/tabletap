// src/components/ui/Alert.tsx
import { ReactNode } from 'react';
import { clsx } from 'clsx';

interface AlertProps {
  children: ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'error';
  className?: string;
}

export function Alert({ 
  children, 
  variant = 'info', 
  className = '' 
}: AlertProps) {
  const baseStyles = 'p-4 rounded-md';
  
  const variantStyles = {
    info: 'bg-blue-50 text-blue-800',
    success: 'bg-green-50 text-green-800',
    warning: 'bg-yellow-50 text-yellow-800',
    error: 'bg-red-50 text-red-800',
  };
  
  const alertClasses = clsx(
    baseStyles,
    variantStyles[variant],
    className
  );
  
  return (
    <div className={alertClasses}>
      {children}
    </div>
  );
}