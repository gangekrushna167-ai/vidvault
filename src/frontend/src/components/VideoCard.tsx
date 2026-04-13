import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "@tanstack/react-router";
import {
  Calendar,
  CheckSquare,
  Film,
  HardDrive,
  Play,
  Square,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import type { Video } from "../types";
import { ConfirmDialog } from "./ConfirmDialog";
import { TagBadge } from "./TagBadge";

function formatFileSize(bytes: bigint): string {
  const gb = Number(bytes) / 1024 ** 3;
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = Number(bytes) / 1024 ** 2;
  return `${mb.toFixed(0)} MB`;
}

function formatDate(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

interface VideoCardProps {
  video: Video;
  onDelete: (id: bigint) => void;
  isDeleting?: boolean;
  selectionMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: (id: bigint) => void;
}

export function VideoCard({
  video,
  onDelete,
  isDeleting,
  selectionMode,
  isSelected,
  onToggleSelect,
}: VideoCardProps) {
  const navigate = useNavigate();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const thumbnailUrl = video.thumbnail?.getDirectURL() ?? null;
  const tags = video.tags ?? [];

  const handleCardClick = (e: React.MouseEvent) => {
    if (selectionMode && onToggleSelect) {
      e.preventDefault();
      onToggleSelect(video.id);
      return;
    }
    navigate({ to: "/video/$id", params: { id: video.id.toString() } });
  };

  return (
    <>
      <div
        className={cn(
          "group relative bg-card rounded-xl overflow-hidden border transition-smooth shadow-card hover:shadow-elevated",
          isSelected
            ? "border-primary ring-2 ring-primary/30"
            : "border-border hover:border-primary/40",
        )}
        data-ocid="video-card"
      >
        {/* Selection checkbox */}
        {(selectionMode || isSelected) && (
          <button
            type="button"
            className="absolute top-2 left-2 z-10 transition-smooth"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect?.(video.id);
            }}
            aria-label={isSelected ? "Deselect video" : "Select video"}
            data-ocid="btn-select-video"
          >
            {isSelected ? (
              <CheckSquare className="w-5 h-5 text-primary drop-shadow-sm" />
            ) : (
              <Square className="w-5 h-5 text-foreground/70 drop-shadow-sm hover:text-primary" />
            )}
          </button>
        )}

        {/* Hover checkbox (always available, even when not in selection mode) */}
        {!selectionMode && !isSelected && onToggleSelect && (
          <button
            type="button"
            className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-smooth"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect(video.id);
            }}
            aria-label="Select video"
            data-ocid="btn-hover-select"
          >
            <Square className="w-5 h-5 text-foreground/70 drop-shadow-sm hover:text-primary" />
          </button>
        )}

        {/* Thumbnail */}
        <button
          type="button"
          className="w-full cursor-pointer"
          onClick={handleCardClick}
          aria-label={`Play ${video.title}`}
        >
          <div className="relative aspect-video bg-muted overflow-hidden">
            {thumbnailUrl ? (
              <img
                src={thumbnailUrl}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-smooth"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-muted">
                <Film className="w-10 h-10 text-muted-foreground/25" />
              </div>
            )}
            {/* Play overlay */}
            {!selectionMode && (
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth bg-black/50">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-elevated ring-2 ring-primary/30">
                  <Play className="w-5 h-5 text-primary-foreground fill-primary-foreground ml-0.5" />
                </div>
              </div>
            )}
            {/* Selection overlay */}
            {isSelected && <div className="absolute inset-0 bg-primary/20" />}
          </div>
        </button>

        {/* Info */}
        <div className="p-3.5">
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <button
              type="button"
              className="flex-1 min-w-0 text-left"
              onClick={handleCardClick}
            >
              <h3 className="font-display text-sm font-semibold text-foreground truncate leading-snug hover:text-primary transition-colors duration-200">
                {video.title}
              </h3>
            </button>
            {!selectionMode && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-smooth"
                onClick={() => setConfirmOpen(true)}
                disabled={isDeleting}
                aria-label="Delete video"
                data-ocid="btn-delete-video"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2" data-ocid="video-tags">
              {tags.slice(0, 3).map((tag) => (
                <TagBadge key={tag} tag={tag} size="xs" />
              ))}
              {tags.length > 3 && (
                <span className="text-[10px] text-muted-foreground self-center">
                  +{tags.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3 h-3 shrink-0" />
              {formatDate(video.createdAt)}
            </span>
            <span className="flex items-center gap-1.5">
              <HardDrive className="w-3 h-3 shrink-0" />
              {formatFileSize(video.fileSize)}
            </span>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete Video"
        description={`"${video.title}" will be permanently deleted. This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={() => {
          onDelete(video.id);
          setConfirmOpen(false);
        }}
      />
    </>
  );
}
