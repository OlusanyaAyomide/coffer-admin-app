'use client';

import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { DEBOUNCE_IN_MS } from '@/constants/Constants';

interface TableSearchProps {
  placeholder?: string;
  className?: string;
  onSearchChange: (value: string) => void;
  searchTerm: string;
  disabled?: boolean;
}

export function TableSearch({ placeholder = 'Search...', className, onSearchChange, searchTerm, disabled }: TableSearchProps) {
  const [inputValue, setInputValue] = useState(searchTerm);

  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Only fire if the local value differs from the prop 
      // (prevents loop when parent updates prop to match local value)
      if (inputValue !== searchTerm) {
        onSearchChange(inputValue);
      }
    }, DEBOUNCE_IN_MS);

    return () => clearTimeout(timeoutId);
  }, [inputValue, searchTerm, onSearchChange]);

  return (
    <div className={cn("relative w-full max-w-sm py-1 pl-[2px] overflow-visible", className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
      <Input
        placeholder={placeholder}
        value={inputValue}
        disabled={disabled}
        onChange={(e) => setInputValue(e.target.value)}
        className={cn(
          `
          h-10 sm:h-12 w-full pl-10 pr-4 py-1
          font-light text-foreground
          border border-border
          bg-background
          transition-colors
          focus-visible:outline-none
          focus-visible:ring-primary
          focus-visible:ring-1
          focus:border-primary
          disabled:cursor-not-allowed
          disabled:opacity-50
          `
        )}
      />
    </div>
  );
}
