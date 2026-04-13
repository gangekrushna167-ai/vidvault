import { cn } from "@/lib/utils";

// Deterministic color slot from tag string — maps to semantic CSS variable pairs
function tagColorClass(tag: string): string {
  const classes = [
    "bg-primary/15 text-primary border-primary/20",
    "bg-secondary/15 text-secondary-foreground border-secondary/30",
    "bg-accent/20 text-accent-foreground border-accent/30",
    "bg-primary/10 text-primary/80 border-primary/15",
    "bg-muted text-muted-foreground border-border",
    "bg-primary/20 text-primary border-primary/30",
    "bg-secondary/20 text-secondary-foreground border-secondary/40",
    "bg-accent/15 text-foreground border-accent/25",
  ];
  let hash = 0;
  for (let i = 0; i < tag.length; i++)
    hash = (hash * 31 + tag.charCodeAt(i)) | 0;
  return classes[Math.abs(hash) % classes.length];
}

interface TagBadgeProps {
  tag: string;
  onRemove?: () => void;
  onClick?: () => void;
  active?: boolean;
  className?: string;
  size?: "sm" | "xs";
}

export function TagBadge({
  tag,
  onRemove,
  onClick,
  active,
  className,
  size = "sm",
}: TagBadgeProps) {
  const color = tagColorClass(tag);
  const sizeClasses =
    size === "xs"
      ? "text-[10px] px-1.5 py-0 gap-1 h-4"
      : "text-xs px-2 py-0.5 gap-1.5 h-5";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border font-medium transition-smooth",
        sizeClasses,
        active ? color.replace("/15", "/30") : color,
        onClick && "cursor-pointer hover:opacity-80",
        className,
      )}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
      data-ocid="tag-badge"
    >
      {tag}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="rounded-full hover:bg-foreground/10 transition-colors w-3 h-3 flex items-center justify-center shrink-0"
          aria-label={`Remove tag ${tag}`}
        >
          <svg
            viewBox="0 0 8 8"
            className="w-2 h-2 fill-current"
            aria-hidden="true"
          >
            <path
              d="M1 1l6 6M7 1L1 7"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
    </span>
  );
}
