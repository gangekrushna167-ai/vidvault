import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Search videos…",
  debounceMs = 350,
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external value changes (e.g. from URL on mount)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setLocalValue(next);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChange(next);
    }, debounceMs);
  };

  const handleClear = () => {
    setLocalValue("");
    if (timerRef.current) clearTimeout(timerRef.current);
    onChange("");
  };

  return (
    <div className="relative flex-1 min-w-52 max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-9 pr-8 bg-card border-border focus-visible:border-primary/60 transition-colors duration-200"
        data-ocid="input-search"
        aria-label="Search videos"
      />
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200 p-0.5 rounded"
          aria-label="Clear search"
          data-ocid="btn-search-clear"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
