'use client';

import { useEffect, useState } from 'react';
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
    <div className={cn("relative w-full max-w-md py-1 overflow-visible", className)}>
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
      <Input
        placeholder={placeholder}
        value={inputValue}
        disabled={disabled}
        onChange={(e) => setInputValue(e.target.value)}
        className={cn(
          `
          h-11 w-full pl-10 pr-4
          text-foreground
          rounded-lg border border-border
          bg-card
          `
        )}
      />
    </div>
  );
}
