import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Film,
  FolderOpen,
  HardDrive,
  Tag,
  Trash2,
} from "lucide-react";
import type { Collection, Video } from "../types";
import { TagBadge } from "./TagBadge";

interface VideoMetadataProps {
  video: Video;
  collection?: Collection;
  onDeleteRequest: () => void;
}

function formatFileSize(bytes: bigint): string {
  const gb = Number(bytes) / 1024 ** 3;
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = Number(bytes) / 1024 ** 2;
  if (mb >= 1) return `${mb.toFixed(0)} MB`;
  const kb = Number(bytes) / 1024;
  return `${kb.toFixed(0)} KB`;
}

function formatDate(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

interface MetaRowProps {
  icon: React.ReactNode;
  children: React.ReactNode;
}

function MetaRow({ icon, children }: MetaRowProps) {
  return (
    <div className="flex items-center gap-2.5 text-sm text-muted-foreground">
      <span className="shrink-0 text-muted-foreground/70">{icon}</span>
      <span className="truncate min-w-0">{children}</span>
    </div>
  );
}

export function VideoMetadata({
  video,
  collection,
  onDeleteRequest,
}: VideoMetadataProps) {
  const tags = video.tags ?? [];

  return (
    <div className="space-y-3" data-ocid="video-metadata">
      <div className="bg-card rounded-xl p-5 border border-border space-y-4">
        <h3 className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          Details
        </h3>
        <div className="space-y-3">
          <MetaRow icon={<Film className="w-4 h-4" />}>
            <span className="truncate">{video.filename}</span>
          </MetaRow>
          <MetaRow icon={<HardDrive className="w-4 h-4" />}>
            {formatFileSize(video.fileSize)}
          </MetaRow>
          <MetaRow icon={<Calendar className="w-4 h-4" />}>
            {formatDate(video.createdAt)}
          </MetaRow>
          {collection && (
            <div className="flex items-center gap-2.5">
              <FolderOpen className="w-4 h-4 shrink-0 text-muted-foreground/70" />
              <Badge
                variant="secondary"
                className="text-xs font-medium"
                data-ocid="badge-collection"
              >
                {collection.title}
              </Badge>
            </div>
          )}
          {tags.length > 0 && (
            <div className="flex items-start gap-2.5" data-ocid="metadata-tags">
              <Tag className="w-4 h-4 shrink-0 text-muted-foreground/70 mt-0.5" />
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <TagBadge key={tag} tag={tag} size="sm" />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Button
        variant="ghost"
        className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 transition-smooth"
        onClick={onDeleteRequest}
        data-ocid="btn-delete"
      >
        <Trash2 className="w-4 h-4" />
        Delete Video
      </Button>
    </div>
  );
}
