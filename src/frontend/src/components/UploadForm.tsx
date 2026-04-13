import { Button } from "@/components/ui/button";
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
import { ImageIcon, Loader2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ExternalBlob } from "../backend";
import type { Collection } from "../types";
import { FileDropzone } from "./FileDropzone";
import { ProgressBar } from "./ProgressBar";
import { TagInput } from "./TagInput";

interface UploadFormProps {
  collections: Collection[];
  onSuccess: () => void;
  onCancel: () => void;
  onSubmit: (args: {
    title: string;
    description: string;
    blob: ExternalBlob;
    thumbnail?: ExternalBlob | null;
    filename: string;
    fileSize: bigint;
    collectionId?: bigint | null;
    tags?: string[] | null;
  }) => Promise<unknown>;
  isPending: boolean;
  allTags?: string[];
}

interface FormState {
  title: string;
  description: string;
  collectionId: string;
  videoFile: File | null;
  thumbnailFile: File | null;
  isDragging: boolean;
  tags: string[];
}

export function UploadForm({
  collections,
  onSuccess,
  onCancel,
  onSubmit,
  isPending,
  allTags = [],
}: UploadFormProps) {
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [thumbProgress, setThumbProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    collectionId: "none",
    videoFile: null,
    thumbnailFile: null,
    isDragging: false,
    tags: [],
  });

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleVideoSelect = (file: File) => {
    if (!file.type.startsWith("video/")) {
      toast.error("Please select a valid video file (MP4, MOV, MKV, WebM)");
      return;
    }
    setField("videoFile", file);
    if (!form.title.trim()) {
      setField("title", file.name.replace(/\.[^.]+$/, ""));
    }
  };

  const handleThumbnailSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file for the thumbnail");
      return;
    }
    setField("thumbnailFile", file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.videoFile) {
      toast.error("Please select a video file");
      return;
    }
    if (!form.title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsUploading(true);
    setVideoProgress(0);
    setThumbProgress(0);

    try {
      const videoBytes = new Uint8Array(await form.videoFile.arrayBuffer());
      const videoBlob = ExternalBlob.fromBytes(videoBytes).withUploadProgress(
        (pct) => setVideoProgress(pct),
      );

      let thumbnailBlob: ExternalBlob | null = null;
      if (form.thumbnailFile) {
        const thumbBytes = new Uint8Array(
          await form.thumbnailFile.arrayBuffer(),
        );
        thumbnailBlob = ExternalBlob.fromBytes(thumbBytes).withUploadProgress(
          (pct) => setThumbProgress(pct),
        );
      }

      await onSubmit({
        title: form.title.trim(),
        description: form.description.trim(),
        blob: videoBlob,
        thumbnail: thumbnailBlob,
        filename: form.videoFile.name,
        fileSize: BigInt(form.videoFile.size),
        collectionId:
          form.collectionId !== "none" ? BigInt(form.collectionId) : null,
        tags: form.tags.length > 0 ? form.tags : null,
      });

      toast.success("Video uploaded successfully!");
      onSuccess();
    } catch (err) {
      console.error("Upload failed", err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const busy = isPending || isUploading;

  return (
    <form onSubmit={handleSubmit} className="space-y-8" noValidate>
      {/* Video dropzone */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Video File <span className="text-destructive">*</span>
        </Label>
        <FileDropzone
          file={form.videoFile}
          isDragging={form.isDragging}
          accept="video/*"
          onFileSelect={handleVideoSelect}
          onClear={() => setField("videoFile", null)}
          onDragOver={() => setField("isDragging", true)}
          onDragLeave={() => setField("isDragging", false)}
        />
      </div>

      {/* Upload progress */}
      {busy && (
        <div className="space-y-3 p-4 rounded-xl bg-card border border-border">
          <ProgressBar
            value={videoProgress}
            label="Uploading video"
            data-ocid="progress-video"
          />
          {form.thumbnailFile && (
            <ProgressBar
              value={thumbProgress}
              label="Uploading thumbnail"
              data-ocid="progress-thumb"
            />
          )}
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label
          htmlFor="upload-title"
          className="text-sm font-medium text-foreground"
        >
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="upload-title"
          value={form.title}
          onChange={(e) => setField("title", e.target.value)}
          placeholder="Enter a title for this video"
          className="bg-card border-border focus-visible:ring-primary/50"
          required
          disabled={busy}
          data-ocid="input-title"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label
          htmlFor="upload-description"
          className="text-sm font-medium text-foreground"
        >
          Description
        </Label>
        <Textarea
          id="upload-description"
          value={form.description}
          onChange={(e) => setField("description", e.target.value)}
          placeholder="Add a description, notes, or credits…"
          className="bg-card border-border resize-none focus-visible:ring-primary/50"
          rows={3}
          disabled={busy}
          data-ocid="input-description"
        />
      </div>

      {/* Collection */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Collection
        </Label>
        <Select
          value={form.collectionId}
          onValueChange={(val) => setField("collectionId", val)}
          disabled={busy}
        >
          <SelectTrigger
            className="bg-card border-border focus:ring-primary/50"
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
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Tags{" "}
          <span className="text-muted-foreground font-normal text-xs ml-1">
            optional
          </span>
        </Label>
        <TagInput
          tags={form.tags}
          onChange={(tags) => setField("tags", tags)}
          suggestions={allTags}
          placeholder="Add tags (press Enter or comma)…"
          disabled={busy}
          data-ocid="input-tags"
        />
      </div>

      {/* Thumbnail */}
      <div className="space-y-2">
        <Label className="text-sm font-medium text-foreground">
          Thumbnail{" "}
          <span className="text-muted-foreground font-normal text-xs ml-1">
            optional
          </span>
        </Label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border bg-card hover:border-primary/40 hover:bg-muted/20 transition-smooth text-sm text-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => thumbnailInputRef.current?.click()}
            disabled={busy}
            data-ocid="btn-thumbnail"
          >
            <ImageIcon className="w-4 h-4" />
            {form.thumbnailFile ? "Change thumbnail" : "Add thumbnail image"}
          </button>
          {form.thumbnailFile && (
            <span className="text-xs text-muted-foreground truncate max-w-[180px]">
              {form.thumbnailFile.name}
            </span>
          )}
        </div>
        <input
          ref={thumbnailInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleThumbnailSelect}
          data-ocid="input-thumbnail"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="submit"
          className="flex-1 gap-2 font-medium"
          disabled={busy || !form.videoFile}
          data-ocid="btn-submit"
        >
          {busy ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="w-4 h-4" />
              Upload Video
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="border-border hover:bg-muted/30"
          onClick={onCancel}
          disabled={busy}
          data-ocid="btn-cancel"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
