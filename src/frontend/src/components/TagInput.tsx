import { Input } from "@/components/ui/input";
import { useEffect, useRef, useState } from "react";
import { TagBadge } from "./TagBadge";

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  placeholder?: string;
  disabled?: boolean;
  "data-ocid"?: string;
}

export function TagInput({
  tags,
  onChange,
  suggestions = [],
  placeholder = "Add tag…",
  disabled,
  "data-ocid": dataOcid,
}: TagInputProps) {
  const [input, setInput] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filtered = suggestions.filter(
    (s) =>
      s.toLowerCase().includes(input.toLowerCase()) &&
      !tags.includes(s) &&
      input.length > 0,
  );

  const addTag = (tag: string) => {
    const trimmed = tag.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (input.trim()) addTag(input);
    } else if (e.key === "Backspace" && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative" data-ocid={dataOcid}>
      <div
        className="flex flex-wrap gap-1.5 min-h-9 p-2 rounded-md border border-input bg-background focus-within:ring-2 focus-within:ring-ring/30 cursor-text transition-smooth"
        onClick={() => inputRef.current?.focus()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.focus()}
        role="presentation"
      >
        {tags.map((tag) => (
          <TagBadge
            key={tag}
            tag={tag}
            onRemove={disabled ? undefined : () => removeTag(tag)}
          />
        ))}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => input && setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : ""}
          disabled={disabled}
          className="flex-1 min-w-[80px] bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none disabled:cursor-not-allowed"
          data-ocid="tag-input-field"
        />
      </div>

      {showSuggestions && filtered.length > 0 && (
        <div className="absolute z-50 top-full mt-1 w-full bg-popover border border-border rounded-md shadow-elevated overflow-hidden">
          {filtered.slice(0, 8).map((s) => (
            <button
              key={s}
              type="button"
              className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted/50 transition-colors"
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(s);
              }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
