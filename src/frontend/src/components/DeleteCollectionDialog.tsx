import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { useDeleteCollection } from "../hooks/useCollections";
import type { Collection, DeleteCollectionStrategy } from "../types";
import { ConfirmDialog } from "./ConfirmDialog";

interface DeleteCollectionDialogProps {
  target: Collection | null;
  otherCollections: Collection[];
  onClose: () => void;
}

type StrategyKey = "moveToUncategorized" | "deleteVideos" | `move:${string}`;

function buildStrategy(strategyKey: StrategyKey): DeleteCollectionStrategy {
  if (strategyKey === "deleteVideos") return { deleteVideos: null };
  if (strategyKey === "moveToUncategorized")
    return { moveToUncategorized: null };
  const rawId = strategyKey.replace("move:", "");
  return { moveToCollection: BigInt(rawId) };
}

export function DeleteCollectionDialog({
  target,
  otherCollections,
  onClose,
}: DeleteCollectionDialogProps) {
  const deleteCollection = useDeleteCollection();
  const [strategyKey, setStrategyKey] = useState<StrategyKey>(
    "moveToUncategorized",
  );

  const handleConfirm = async () => {
    if (!target) return;
    const strategy = buildStrategy(strategyKey);
    await deleteCollection.mutateAsync({ id: target.id, strategy });
    toast.success(`"${target.title}" deleted`);
    setStrategyKey("moveToUncategorized");
    onClose();
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setStrategyKey("moveToUncategorized");
      onClose();
    }
  };

  return (
    <ConfirmDialog
      open={!!target}
      onOpenChange={handleOpenChange}
      title={target ? `Delete "${target.title}"` : "Delete Collection"}
      description="Choose what to do with the videos in this collection before deleting it."
      confirmLabel="Delete Collection"
      variant="destructive"
      onConfirm={handleConfirm}
    >
      <div className="py-3 space-y-2">
        <p className="text-sm font-medium text-foreground">
          What should happen to the videos?
        </p>
        <Select
          value={strategyKey}
          onValueChange={(v) => setStrategyKey(v as StrategyKey)}
        >
          <SelectTrigger
            className="bg-background border-input focus:ring-primary/50"
            data-ocid="select-delete-strategy"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border">
            <SelectItem value="moveToUncategorized">
              Move to Uncategorized
            </SelectItem>
            <SelectItem value="deleteVideos">Delete all videos</SelectItem>
            {otherCollections.map((c) => (
              <SelectItem key={c.id.toString()} value={`move:${c.id}`}>
                Move to &quot;{c.title}&quot;
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </ConfirmDialog>
  );
}
