import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, FolderOpen, Pencil, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useRenameCollection } from "../hooks/useCollections";
import type { Collection } from "../types";

interface CollectionItemProps {
  collection: Collection;
  videoCount: number;
  onDeleteRequest: (collection: Collection) => void;
}

export function CollectionItem({
  collection,
  videoCount,
  onDeleteRequest,
}: CollectionItemProps) {
  const renameCollection = useRenameCollection();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(collection.title);

  const handleRename = async () => {
    const trimmed = editTitle.trim();
    if (!trimmed || trimmed === collection.title) {
      setIsEditing(false);
      setEditTitle(collection.title);
      return;
    }
    await renameCollection.mutateAsync({ id: collection.id, title: trimmed });
    toast.success("Collection renamed");
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleRename();
    if (e.key === "Escape") {
      setIsEditing(false);
      setEditTitle(collection.title);
    }
  };

  const startEdit = () => {
    setEditTitle(collection.title);
    setIsEditing(true);
  };

  return (
    <div
      className="flex items-center gap-4 bg-card rounded-xl px-5 py-4 border border-border group transition-smooth hover:border-primary/30 hover:shadow-card"
      data-ocid="collection-item"
    >
      <FolderOpen className="w-5 h-5 text-primary shrink-0" />

      {isEditing ? (
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Input
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="bg-background border-input h-8 text-sm focus-visible:ring-primary/50"
            autoFocus
            data-ocid="input-rename"
          />
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0 hover:bg-primary/10"
            onClick={handleRename}
            disabled={renameCollection.isPending}
            aria-label="Save rename"
            data-ocid="btn-save-rename"
          >
            <Check className="w-3.5 h-3.5 text-primary" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 shrink-0"
            onClick={() => {
              setIsEditing(false);
              setEditTitle(collection.title);
            }}
            aria-label="Cancel rename"
            data-ocid="btn-cancel-rename"
          >
            <X className="w-3.5 h-3.5 text-muted-foreground" />
          </Button>
        </div>
      ) : (
        <div className="flex-1 min-w-0 flex items-center gap-3">
          <span className="font-medium text-foreground truncate">
            {collection.title}
          </span>
          <Badge
            variant="secondary"
            className="text-xs shrink-0 bg-muted text-muted-foreground"
          >
            {videoCount} video{videoCount !== 1 ? "s" : ""}
          </Badge>
        </div>
      )}

      {!isEditing && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-smooth">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
            onClick={startEdit}
            aria-label="Rename collection"
            data-ocid="btn-rename"
          >
            <Pencil className="w-3.5 h-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={() => onDeleteRequest(collection)}
            aria-label="Delete collection"
            data-ocid="btn-delete-collection"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
