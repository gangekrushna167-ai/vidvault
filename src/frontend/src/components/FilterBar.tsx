import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowDownAZ,
  ArrowUpAZ,
  CalendarDays,
  SlidersHorizontal,
  Tag,
} from "lucide-react";
import type { Collection } from "../types";
import { SearchBar } from "./SearchBar";
import { TagBadge } from "./TagBadge";

export type SortField = "dateAdded" | "title" | "fileSize";
export type SortOrder = "asc" | "desc";

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (v: string) => void;
  sortField: SortField;
  onSortFieldChange: (v: SortField) => void;
  sortOrder: SortOrder;
  onSortOrderToggle: () => void;
  dateFrom: string;
  onDateFromChange: (v: string) => void;
  dateTo: string;
  onDateToChange: (v: string) => void;
  activeCollectionId: string | undefined;
  collections: Collection[];
  onCollectionChange: (id: string | undefined) => void;
  allTags?: string[];
  selectedTags?: string[];
  onTagToggle?: (tag: string) => void;
}

export function FilterBar({
  searchQuery,
  onSearchChange,
  sortField,
  onSortFieldChange,
  sortOrder,
  onSortOrderToggle,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  activeCollectionId,
  collections,
  onCollectionChange,
  allTags = [],
  selectedTags = [],
  onTagToggle,
}: FilterBarProps) {
  return (
    <div className="space-y-3 mb-8" data-ocid="filter-bar">
      {/* Row 1: search + sort */}
      <div className="flex items-center gap-3 flex-wrap">
        <SearchBar value={searchQuery} onChange={onSearchChange} />

        {/* Sort field */}
        <Select
          value={sortField}
          onValueChange={(v) => onSortFieldChange(v as SortField)}
        >
          <SelectTrigger
            className="w-44 bg-card border-border"
            data-ocid="select-sort-field"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 mr-1.5 text-muted-foreground shrink-0" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="dateAdded">Date Added</SelectItem>
            <SelectItem value="title">Title</SelectItem>
            <SelectItem value="fileSize">File Size</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort order toggle */}
        <Button
          variant="outline"
          size="icon"
          onClick={onSortOrderToggle}
          className="bg-card border-border h-9 w-9 shrink-0"
          aria-label={
            sortOrder === "asc" ? "Sort ascending" : "Sort descending"
          }
          data-ocid="btn-sort-order"
          title={sortOrder === "asc" ? "Ascending" : "Descending"}
        >
          {sortOrder === "asc" ? (
            <ArrowUpAZ className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ArrowDownAZ className="w-4 h-4 text-muted-foreground" />
          )}
        </Button>

        {/* Date range */}
        <div
          className="flex items-center gap-2 text-sm"
          data-ocid="date-range-filter"
        >
          <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => onDateFromChange(e.target.value)}
            className="w-36 bg-card border-border text-xs h-9 [color-scheme:dark]"
            aria-label="Date from"
            data-ocid="input-date-from"
          />
          <span className="text-muted-foreground text-xs">–</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => onDateToChange(e.target.value)}
            className="w-36 bg-card border-border text-xs h-9 [color-scheme:dark]"
            aria-label="Date to"
            data-ocid="input-date-to"
          />
        </div>
      </div>

      {/* Row 2: collection chips */}
      <div className="flex gap-2 flex-wrap items-center">
        <Badge
          variant={!activeCollectionId ? "default" : "outline"}
          className="cursor-pointer transition-smooth select-none"
          onClick={() => onCollectionChange(undefined)}
          data-ocid="filter-all"
        >
          All
        </Badge>
        {collections.map((col) => (
          <Badge
            key={col.id.toString()}
            variant={
              activeCollectionId === col.id.toString() ? "default" : "outline"
            }
            className="cursor-pointer transition-smooth select-none"
            onClick={() => onCollectionChange(col.id.toString())}
            data-ocid="filter-collection"
          >
            {col.title}
          </Badge>
        ))}
      </div>

      {/* Row 3: tag filter chips */}
      {allTags.length > 0 && onTagToggle && (
        <div
          className="flex gap-1.5 flex-wrap items-center"
          data-ocid="tag-filter-row"
        >
          <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground shrink-0 mr-1">
            <Tag className="w-3 h-3" />
            Tags
          </span>
          {allTags.map((tag) => (
            <TagBadge
              key={tag}
              tag={tag}
              active={selectedTags.includes(tag)}
              onClick={() => onTagToggle(tag)}
              size="sm"
            />
          ))}
          {selectedTags.length > 0 && (
            <button
              type="button"
              className="text-[10px] text-muted-foreground hover:text-foreground transition-colors ml-1"
              onClick={() => {
                for (const t of selectedTags) onTagToggle(t);
              }}
              data-ocid="btn-clear-tags"
            >
              Clear
            </button>
          )}
        </div>
      )}
    </div>
  );
}
