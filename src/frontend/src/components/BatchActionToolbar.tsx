import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { FolderInput, Tag, Trash2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useBatchVideoAction } from "../hooks/useBatchActions";
import type { Collection } from "../types";

interface BatchActionToolbarProps {
  selectedIds: Set<string>;
  onDeselectAll: () => void;
  onSelectAll?: () => void;
  onTagAction: () => void;
  collections: Collection[];
  onActionsComplete?: () => void;
}

export function BatchActionToolbar({
  selectedIds,
  onDeselectAll,
  onSelectAll,
  onTagAction,
  collections,
  onActionsComplete,
}: BatchActionToolbarProps) {
  const count = selectedIds.size;
  const batchAction = useBatchVideoAction();
  const [moveTarget, setMoveTarget] = useState<string>("");

  if (count === 0) return null;

  const videoIds = Array.from(selectedIds).map((id) => BigInt(id));

  const handleDelete = () => {
    batchAction.mutate(
      { videoIds, action: { delete: null } },
      {
        onSuccess: (n) => {
          toast.success(`Deleted ${n} video${n !== 1n ? "s" : ""}`);
          onDeselectAll();
          onActionsComplete?.();
        },
        onError: () => toast.error("Failed to delete videos"),
      },
    );
  };

  const handleMove = () => {
    if (!moveTarget) return;
    const collectionId =
      moveTarget === "uncategorized" ? null : BigInt(moveTarget);
    batchAction.mutate(
      { videoIds, action: { moveToCollection: collectionId } },
      {
        onSuccess: (n) => {
          toast.success(`Moved ${n} video${n !== 1n ? "s" : ""}`);
          onDeselectAll();
          onActionsComplete?.();
        },
        onError: () => toast.error("Failed to move videos"),
      },
    );
  };

  return (
    <div
      className="flex items-center gap-2 flex-wrap py-2.5 px-4 rounded-xl bg-card border border-primary/30 shadow-elevated mb-4"
      data-ocid="batch-action-toolbar"
    >
      <span className="text-sm font-medium text-foreground shrink-0">
        <span className="text-primary font-semibold">{count}</span> selected
      </span>

      <Separator orientation="vertical" className="h-5 mx-1" />

      {/* Tag action */}
      <Button
        variant="outline"
        size="sm"
        className="gap-1.5 h-8 text-xs"
        onClick={onTagAction}
        disabled={batchAction.isPending}
        data-ocid="btn-batch-tag"
      >
        <Tag className="w-3.5 h-3.5" />
        Add Tags
      </Button>

      {/* Move to collection */}
      <div className="flex items-center gap-1.5">
        <Select value={moveTarget} onValueChange={setMoveTarget}>
          <SelectTrigger
            className="h-8 text-xs w-44 bg-background border-border"
            data-ocid="select-batch-move"
          >
            <FolderInput className="w-3 h-3 mr-1.5 text-muted-foreground shrink-0" />
            <SelectValue placeholder="Move to…" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="uncategorized">Uncategorized</SelectItem>
            {collections.map((col) => (
              <SelectItem key={col.id.toString()} value={col.id.toString()}>
                {col.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {moveTarget && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs"
            onClick={handleMove}
            disabled={batchAction.isPending}
            data-ocid="btn-batch-move-confirm"
          >
            Move
          </Button>
        )}
      </div>

      {/* Delete */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={handleDelete}
        disabled={batchAction.isPending}
        data-ocid="btn-batch-delete"
      >
        <Trash2 className="w-3.5 h-3.5" />
        Delete
      </Button>

      <div className="flex-1" />

      {/* Select all / Deselect all */}
      {onSelectAll && (
        <Button
          variant="ghost"
          size="sm"
          className="gap-1.5 h-8 text-xs text-muted-foreground hover:text-foreground"
          onClick={onSelectAll}
          data-ocid="btn-select-all"
        >
          Select All
        </Button>
      )}
      {/* Deselect all */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 h-8 text-xs text-muted-foreground hover:text-foreground"
        onClick={onDeselectAll}
        data-ocid="btn-deselect-all"
      >
        <X className="w-3.5 h-3.5" />
        Deselect All
      </Button>
    </div>
  );
}
