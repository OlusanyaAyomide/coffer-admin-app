import { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import useCountries from '@/hooks/useCountries';

type CountryMultiSelectProps = {
  value: Array<string>;
  onChange: (next: Array<string>) => void;
};

/** Searchable multi-select of countries, backed by the /countries catalog. */
export default function CountryMultiSelect({
  value,
  onChange,
}: CountryMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const { countries, isCountriesLoading } = useCountries({ enabled: open });

  const toggle = (id: string) => {
    onChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id],
    );
  };

  const selected = countries.filter((c) => value.includes(c.id));

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between font-normal">
            <span className="text-muted-foreground">
              {value.length
                ? `${value.length} countr${value.length === 1 ? 'y' : 'ies'} selected`
                : 'Any country'}
            </span>
            <ChevronsUpDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search countries…" />
            <CommandList>
              <CommandEmpty>
                {isCountriesLoading ? 'Loading…' : 'No country found.'}
              </CommandEmpty>
              <CommandGroup>
                {countries.map((country) => (
                  <CommandItem
                    key={country.id}
                    value={country.name}
                    onSelect={() => toggle(country.id)}>
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value.includes(country.id) ? 'opacity-100' : 'opacity-0',
                      )}
                    />
                    {country.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((c) => (
            <Badge key={c.id} variant="secondary" className="gap-1">
              {c.name}
              <button
                type="button"
                onClick={() => toggle(c.id)}
                className="ml-0.5 rounded-full hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
