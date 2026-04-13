import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useBatchVideoAction } from "../hooks/useBatchActions";
import { TagInput } from "./TagInput";

interface BatchTagModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: Set<string>;
  allTags: string[];
  onComplete?: () => void;
}

export function BatchTagModal({
  open,
  onOpenChange,
  selectedIds,
  allTags,
  onComplete,
}: BatchTagModalProps) {
  const [addTags, setAddTags] = useState<string[]>([]);
  const [removeTags, setRemoveTags] = useState<string[]>([]);
  const batchAction = useBatchVideoAction();
  const videoIds = Array.from(selectedIds).map((id) => BigInt(id));
  const count = selectedIds.size;

  const handleApply = async () => {
    if (addTags.length === 0 && removeTags.length === 0) {
      toast.warning("Add or remove at least one tag");
      return;
    }
    try {
      if (addTags.length > 0) {
        await batchAction.mutateAsync({ videoIds, action: { addTags } });
      }
      if (removeTags.length > 0) {
        await batchAction.mutateAsync({ videoIds, action: { removeTags } });
      }
      toast.success(`Tags updated on ${count} video${count !== 1 ? "s" : ""}`);
      setAddTags([]);
      setRemoveTags([]);
      onOpenChange(false);
      onComplete?.();
    } catch {
      toast.error("Failed to update tags");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-card border-border max-w-md"
        data-ocid="batch-tag-modal"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">
            Batch Tag — {count} Video{count !== 1 ? "s" : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <Plus className="w-3 h-3" />
              Add Tags
            </Label>
            <TagInput
              tags={addTags}
              onChange={setAddTags}
              suggestions={allTags.filter((t) => !addTags.includes(t))}
              placeholder="Type and press Enter…"
              data-ocid="input-add-tags"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
              <Minus className="w-3 h-3" />
              Remove Tags
            </Label>
            <TagInput
              tags={removeTags}
              onChange={setRemoveTags}
              suggestions={allTags.filter((t) => !removeTags.includes(t))}
              placeholder="Type and press Enter…"
              data-ocid="input-remove-tags"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <Button
              onClick={handleApply}
              disabled={batchAction.isPending}
              className="flex-1 gap-2"
              data-ocid="btn-apply-tags"
            >
              {batchAction.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              Apply Tags
            </Button>
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              data-ocid="btn-cancel-batch-tag"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
