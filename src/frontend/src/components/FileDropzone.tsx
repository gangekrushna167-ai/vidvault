import { cn } from "@/lib/utils";
import { Film, Upload, X } from "lucide-react";
import { useRef } from "react";

interface FileDropzoneProps {
  file: File | null;
  isDragging: boolean;
  accept?: string;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  onDragOver: () => void;
  onDragLeave: () => void;
  className?: string;
}

function formatBytes(bytes: number): string {
  const gb = bytes / 1024 ** 3;
  if (gb >= 1) return `${gb.toFixed(2)} GB`;
  const mb = bytes / 1024 ** 2;
  return `${mb.toFixed(1)} MB`;
}

export function FileDropzone({
  file,
  isDragging,
  accept = "video/*",
  onFileSelect,
  onClear,
  onDragOver,
  onDragLeave,
  className,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    onDragLeave();
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFileSelect(dropped);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) onFileSelect(selected);
  };

  return (
    <button
      type="button"
      className={cn(
        "relative w-full border-2 border-dashed rounded-2xl p-10 text-center transition-smooth cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isDragging
          ? "border-primary bg-primary/8 scale-[1.01]"
          : file
            ? "border-primary/50 bg-primary/5"
            : "border-border hover:border-primary/40 hover:bg-muted/20",
        className,
      )}
      onDragOver={(e) => {
        e.preventDefault();
        onDragOver();
      }}
      onDragLeave={onDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      aria-label={
        file
          ? `Selected: ${file.name}. Click to change.`
          : "Select a video file"
      }
      data-ocid="dropzone"
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={handleChange}
        data-ocid="input-file"
      />

      {file ? (
        <div className="space-y-3">
          <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto shadow-card">
            <Film className="w-7 h-7 text-primary" />
          </div>
          <div>
            <p
              className="font-medium text-foreground truncate max-w-xs mx-auto"
              title={file.name}
            >
              {file.name}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {formatBytes(file.size)}
            </p>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors mx-auto"
            onClick={(e) => {
              e.stopPropagation();
              onClear();
            }}
            data-ocid="btn-remove-file"
          >
            <X className="w-3.5 h-3.5" />
            Remove file
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mx-auto">
            <Upload className="w-7 h-7 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">Drop a video here</p>
            <p className="text-sm text-muted-foreground mt-1">
              or click to browse files
            </p>
          </div>
          <p className="text-xs text-muted-foreground/50">
            MP4, MOV, MKV, WebM supported
          </p>
        </div>
      )}
    </button>
  );
}
