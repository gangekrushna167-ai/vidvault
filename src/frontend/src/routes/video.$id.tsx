import { Button } from "@/components/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { EditVideoModal } from "../components/EditVideoModal";
import { ErrorMessage } from "../components/ErrorMessage";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { VideoMetadata } from "../components/VideoMetadata";
import { VideoPlayer } from "../components/VideoPlayer";
import { useAuth } from "../hooks/useAuth";
import { useCollections } from "../hooks/useCollections";
import { useDeleteVideo, useVideo } from "../hooks/useVideos";

export const Route = createFileRoute("/video/$id")({
  component: VideoPage,
});

function VideoPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { data: video, isLoading, isError, refetch } = useVideo(BigInt(id));
  const { data: collections = [] } = useCollections();
  const deleteVideo = useDeleteVideo();

  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  if (!isAuthenticated) {
    navigate({ to: "/" });
    return null;
  }

  if (isLoading) {
    return (
      <LoadingSpinner
        message="Loading video…"
        className="min-h-screen"
        size="lg"
      />
    );
  }

  if (isError || !video) {
    return (
      <ErrorMessage
        title="Video not found"
        message="This video could not be loaded or may have been deleted."
        onRetry={() => refetch()}
        className="min-h-screen"
      />
    );
  }

  const collection =
    video.collectionId !== undefined
      ? collections.find((c) => c.id === video.collectionId)
      : undefined;

  const handleDelete = async () => {
    try {
      await deleteVideo.mutateAsync(video.id);
      toast.success("Video deleted");
      navigate({ to: "/" });
    } catch {
      toast.error("Failed to delete video");
    }
  };

  return (
    <div className="min-h-screen flex flex-col" data-ocid="video-page">
      {/* Back bar */}
      <header className="sticky top-0 z-10 px-6 py-3 bg-card border-b border-border flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/" })}
          className="gap-2 text-muted-foreground hover:text-foreground transition-smooth"
          data-ocid="btn-back"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Library
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowEditModal(true)}
          className="gap-2 text-muted-foreground hover:text-foreground transition-smooth"
          data-ocid="btn-edit"
        >
          <Pencil className="w-4 h-4" />
          Edit
        </Button>
      </header>

      {/* Main content */}
      <div className="flex-1 max-w-6xl w-full mx-auto px-6 py-8 space-y-8">
        {/* Full-bleed cinematic player */}
        <VideoPlayer video={video} />

        {/* Info grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Title + description */}
          <div className="lg:col-span-2 space-y-3" data-ocid="video-info">
            <h1 className="font-display text-3xl font-semibold text-foreground leading-tight tracking-tight">
              {video.title}
            </h1>
            {video.description ? (
              <p className="text-muted-foreground leading-relaxed text-base">
                {video.description}
              </p>
            ) : (
              <button
                type="button"
                onClick={() => setShowEditModal(true)}
                className="text-muted-foreground/50 text-sm italic hover:text-muted-foreground transition-smooth cursor-pointer"
                data-ocid="btn-add-description"
              >
                + Add a description
              </button>
            )}
          </div>

          {/* Sidebar metadata */}
          <VideoMetadata
            video={video}
            collection={collection}
            onDeleteRequest={() => setShowDeleteConfirm(true)}
          />
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && (
        <EditVideoModal
          video={video}
          collections={collections}
          open={showEditModal}
          onOpenChange={setShowEditModal}
        />
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        title="Delete Video"
        description={`Are you sure you want to delete "${video.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
