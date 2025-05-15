// src/components/menu/MenuCategory.tsx
import { ReactNode } from 'react';


interface MenuCategoryProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function MenuCategory({ title, description, children }: MenuCategoryProps) {
  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-2 text-gray-900">{title}</h2>
      {description && <p className="text-gray-600 mb-4">{description}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children}
      </div>
    </div>
  );
}