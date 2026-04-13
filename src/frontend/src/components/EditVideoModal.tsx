import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Check, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useUpdateVideo } from "../hooks/useVideos";
import type { Collection, UpdateVideoRequest, Video } from "../types";
import { TagInput } from "./TagInput";

interface EditVideoModalProps {
  video: Video;
  collections: Collection[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  allTags?: string[];
}

export function EditVideoModal({
  video,
  collections,
  open,
  onOpenChange,
  allTags = [],
}: EditVideoModalProps) {
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState(video.description);
  const [collectionId, setCollectionId] = useState<string>(
    video.collectionId?.toString() ?? "none",
  );
  const [tags, setTags] = useState<string[]>(video.tags ?? []);
  const updateVideo = useUpdateVideo();

  // Reset form whenever the modal opens with fresh video data
  useEffect(() => {
    if (open) {
      setTitle(video.title);
      setDescription(video.description);
      setCollectionId(video.collectionId?.toString() ?? "none");
      setTags(video.tags ?? []);
    }
  }, [open, video]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }
    const req: UpdateVideoRequest = {
      id: video.id,
      title: title.trim(),
      description: description.trim(),
      collectionId: collectionId !== "none" ? BigInt(collectionId) : undefined,
      tags,
    };
    try {
      await updateVideo.mutateAsync(req);
      toast.success("Video updated");
      onOpenChange(false);
    } catch {
      toast.error("Failed to update video");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-card border-border max-w-lg"
        data-ocid="edit-video-modal"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground">
            Edit Video
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          {/* Title */}
          <div className="space-y-1.5">
            <Label
              htmlFor="edit-title"
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Title
            </Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background border-input focus-visible:ring-primary"
              placeholder="Video title"
              maxLength={200}
              data-ocid="input-title"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label
              htmlFor="edit-desc"
              className="text-xs font-medium uppercase tracking-wide text-muted-foreground"
            >
              Description
            </Label>
            <Textarea
              id="edit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background border-input focus-visible:ring-primary resize-none"
              placeholder="Add a description…"
              rows={4}
              maxLength={2000}
              data-ocid="input-description"
            />
          </div>

          {/* Collection */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Collection
            </Label>
            <Select value={collectionId} onValueChange={setCollectionId}>
              <SelectTrigger
                className="bg-background border-input focus:ring-primary"
                data-ocid="select-collection"
              >
                <SelectValue placeholder="No collection" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="none">No collection</SelectItem>
                {collections.map((col) => (
                  <SelectItem key={col.id.toString()} value={col.id.toString()}>
                    {col.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Tags
            </Label>
            <TagInput
              tags={tags}
              onChange={setTags}
              suggestions={allTags}
              placeholder="Add tags…"
              data-ocid="input-tags"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleSave}
              disabled={updateVideo.isPending || !title.trim()}
              className="flex-1 gap-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth"
              data-ocid="btn-save"
            >
              {updateVideo.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Check className="w-4 h-4" />
              )}
              {updateVideo.isPending ? "Saving…" : "Save Changes"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="gap-2"
              data-ocid="btn-cancel-edit"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
