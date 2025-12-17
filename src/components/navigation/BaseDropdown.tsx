'use client';

import { ReactNode } from 'react';

interface BaseDropdownProps {
  children: ReactNode;
  title?: string;
}

export default function BaseDropdown({ children, title }: BaseDropdownProps) {
  return (
    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-[600px] animate-megaMenuSlide z-50">
      {/* Fundo sólido que herda o tema (claro/escuro) */}
      <div className="bg-background border border-border rounded-lg shadow-2xl overflow-hidden">
        {title && (
          <div className="px-6 py-4 border-b border-border">
            <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </h3>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
