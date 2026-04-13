import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Film, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useDeleteVideo } from "../hooks/useVideos";
import type { Video } from "../types";
import { VideoCard } from "./VideoCard";

const SKELETON_KEYS = ["a", "b", "c", "d", "e", "f", "g", "h"] as const;

function VideoCardSkeleton() {
  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border">
      <Skeleton className="aspect-video w-full" />
      <div className="p-3.5 space-y-2.5">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
}

interface VideoGridProps {
  videos: Video[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: bigint) => void;
  selectionMode?: boolean;
}

export function VideoGrid({
  videos,
  isLoading,
  isError,
  onRetry,
  selectedIds,
  onToggleSelect,
  selectionMode,
}: VideoGridProps) {
  const { mutate: deleteVideo, isPending: isDeleting } = useDeleteVideo();

  const handleDelete = (id: bigint) => {
    deleteVideo(id, {
      onSuccess: () => toast.success("Video deleted"),
      onError: () => toast.error("Failed to delete video"),
    });
  };

  if (isLoading) {
    return (
      <div
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
        data-ocid="video-grid-skeleton"
      >
        {SKELETON_KEYS.map((k) => (
          <VideoCardSkeleton key={k} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-64 text-center gap-4"
        data-ocid="video-grid-error"
      >
        <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center">
          <RefreshCw className="w-6 h-6 text-destructive" />
        </div>
        <div>
          <p className="font-display text-base font-semibold text-foreground mb-1">
            Failed to load videos
          </p>
          <p className="text-sm text-muted-foreground">
            Something went wrong. Try refreshing.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-2">
          <RefreshCw className="w-3.5 h-3.5" />
          Retry
        </Button>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-64 text-center"
        data-ocid="empty-state"
      >
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4 border border-border">
          <Film className="w-7 h-7 text-muted-foreground/40" />
        </div>
        <h3 className="font-display text-xl font-semibold text-foreground mb-1.5">
          No videos found
        </h3>
        <p className="text-muted-foreground text-sm mb-6 max-w-xs leading-relaxed">
          Start building your library by uploading your first video.
        </p>
        <Button asChild data-ocid="btn-upload-empty">
          <a href="/upload">
            <Plus className="w-4 h-4 mr-2" />
            Upload Video
          </a>
        </Button>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5"
      data-ocid="video-grid"
    >
      {videos.map((video) => (
        <VideoCard
          key={video.id.toString()}
          video={video}
          onDelete={handleDelete}
          isDeleting={isDeleting}
          selectionMode={selectionMode}
          isSelected={selectedIds?.has(video.id.toString())}
          onToggleSelect={onToggleSelect}
        />
      ))}
    </div>
  );
}
