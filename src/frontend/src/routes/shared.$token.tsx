import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { createFileRoute } from "@tanstack/react-router";
import { ExternalLink, Film, Library, Lock, Play, Tag } from "lucide-react";
import { useState } from "react";
import { useSharedVideos } from "../hooks/useShareLinks";
import type { Video } from "../types";

export const Route = createFileRoute("/shared/$token")({
  component: SharedPage,
});

function formatDate(ns: bigint): string {
  const ms = Number(ns / 1_000_000n);
  return new Date(ms).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatFileSize(bytes: bigint): string {
  const gb = Number(bytes) / 1024 ** 3;
  if (gb >= 1) return `${gb.toFixed(1)} GB`;
  const mb = Number(bytes) / 1024 ** 2;
  return `${mb.toFixed(0)} MB`;
}

function SharedVideoCard({
  video,
  onClick,
}: { video: Video; onClick: () => void }) {
  const thumbnailUrl = video.thumbnail?.getDirectURL() ?? null;
  const tags = video.tags ?? [];

  return (
    <button
      type="button"
      className="group bg-card rounded-xl overflow-hidden border border-border hover:border-primary/40 transition-smooth shadow-card hover:shadow-elevated cursor-pointer w-full text-left"
      onClick={onClick}
      data-ocid="shared-video-card"
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
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-smooth bg-black/50">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center shadow-elevated ring-2 ring-primary/30">
            <Play className="w-5 h-5 text-primary-foreground fill-primary-foreground ml-0.5" />
          </div>
        </div>
      </div>

      <div className="p-3.5">
        <h3 className="font-display text-sm font-semibold text-foreground truncate leading-snug mb-1 group-hover:text-primary transition-colors">
          {video.title}
        </h3>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {tags.slice(0, 3).map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-[10px] h-4 px-1.5"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatDate(video.createdAt)}</span>
          <span>{formatFileSize(video.fileSize)}</span>
        </div>
      </div>
    </button>
  );
}

function VideoModal({ video, onClose }: { video: Video; onClose: () => void }) {
  const videoUrl = video.blob.getDirectURL();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      role="presentation"
      data-ocid="shared-video-modal"
    >
      <button
        type="button"
        className="absolute inset-0 w-full h-full cursor-default"
        onClick={onClose}
        aria-label="Close video player"
      />
      <div className="relative bg-card rounded-2xl overflow-hidden w-full max-w-4xl border border-border shadow-elevated z-10">
        <div className="relative bg-black aspect-video">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            src={videoUrl}
            controls
            autoPlay
            className="w-full h-full"
            data-ocid="shared-video-player"
          >
            <track kind="captions" />
          </video>
        </div>
        <div className="p-5 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold text-foreground truncate mb-1">
              {video.title}
            </h2>
            {video.description && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                {video.description}
              </p>
            )}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="shrink-0"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

function SharedPage() {
  const { token } = Route.useParams();
  const { data: videos = [], isLoading, isError } = useSharedVideos(token);
  const [activeVideo, setActiveVideo] = useState<Video | null>(null);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <Film className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <span className="font-display text-lg font-semibold text-foreground">
                VidVault
              </span>
              <span className="text-muted-foreground text-xs ml-2 flex items-center gap-1 inline-flex">
                <Library className="w-3 h-3" />
                Shared Collection
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Lock className="w-3.5 h-3.5" />
            <span>Read-only view</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Scope info */}
        <div className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-primary/5 border border-primary/15">
          <Tag className="w-5 h-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Shared Library
            </p>
            <p className="text-xs text-muted-foreground">
              {isLoading
                ? "Loading…"
                : `${videos.length} video${videos.length !== 1 ? "s" : ""} shared with you`}
            </p>
          </div>
          <div className="ml-auto">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
            >
              <a href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-3 h-3" />
                Open VidVault
              </a>
            </Button>
          </div>
        </div>

        {isLoading && (
          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
            data-ocid="shared-skeleton"
          >
            {["a", "b", "c", "d", "e", "f"].map((k) => (
              <div
                key={k}
                className="bg-card rounded-xl overflow-hidden border border-border"
              >
                <Skeleton className="aspect-video w-full" />
                <div className="p-3.5 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {isError && (
          <div
            className="flex flex-col items-center justify-center min-h-64 text-center gap-4"
            data-ocid="shared-error"
          >
            <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
              <Lock className="w-6 h-6 text-destructive" />
            </div>
            <p className="font-display text-base font-semibold text-foreground mb-1">
              Link not found or expired
            </p>
            <p className="text-sm text-muted-foreground">
              This share link may have been deleted or is invalid.
            </p>
          </div>
        )}

        {!isLoading && !isError && videos.length === 0 && (
          <div
            className="flex flex-col items-center justify-center min-h-64 text-center"
            data-ocid="shared-empty"
          >
            <Film className="w-10 h-10 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground text-sm">
              No videos in this shared collection.
            </p>
          </div>
        )}

        {!isLoading && !isError && videos.length > 0 && (
          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
            data-ocid="shared-video-grid"
          >
            {videos.map((video) => (
              <SharedVideoCard
                key={video.id.toString()}
                video={video}
                onClick={() => setActiveVideo(video)}
              />
            ))}
          </div>
        )}
      </main>

      {activeVideo && (
        <VideoModal video={activeVideo} onClose={() => setActiveVideo(null)} />
      )}
    </div>
  );
}
