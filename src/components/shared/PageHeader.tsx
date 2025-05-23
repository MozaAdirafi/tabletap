// src/components/shared/PageHeader.tsx
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && (
          <p className="text-gray-500 mt-1">{description}</p>
        )}
      </div>
      
      {action && <div className="mt-4 sm:mt-0">{action}</div>}
    </div>
  );
}