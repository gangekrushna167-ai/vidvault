import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FolderOpen } from "lucide-react";
import { useState } from "react";
import { CollectionItem } from "../components/CollectionItem";
import { CreateCollectionForm } from "../components/CreateCollectionForm";
import { DeleteCollectionDialog } from "../components/DeleteCollectionDialog";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { useAuth } from "../hooks/useAuth";
import { useCollections } from "../hooks/useCollections";
import { useVideos } from "../hooks/useVideos";
import type { Collection } from "../types";

export const Route = createFileRoute("/collections")({
  component: CollectionsPage,
});

function CollectionsPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { data: collections = [], isLoading } = useCollections();
  const { data: allVideos = [] } = useVideos();

  const [deleteTarget, setDeleteTarget] = useState<Collection | null>(null);

  if (!isAuthenticated) {
    navigate({ to: "/" });
    return null;
  }

  const getVideoCount = (collectionId: bigint) =>
    allVideos.filter((v) => v.collectionId === collectionId).length;

  const otherCollections = deleteTarget
    ? collections.filter((c) => c.id !== deleteTarget.id)
    : [];

  return (
    <div
      className="min-h-screen p-8 max-w-3xl mx-auto"
      data-ocid="collections-page"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-4xl font-semibold text-foreground tracking-tight mb-2">
          Collections
        </h1>
        <p className="text-muted-foreground">
          Organize your videos into named collections
        </p>
      </div>

      {/* Create form */}
      <div className="mb-8">
        <CreateCollectionForm />
      </div>

      {/* Collections list */}
      {isLoading ? (
        <LoadingSpinner message="Loading collections…" className="min-h-40" />
      ) : collections.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center min-h-48 text-center"
          data-ocid="empty-collections"
        >
          <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
            <FolderOpen className="w-7 h-7 text-muted-foreground/40" />
          </div>
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
            No collections yet
          </h3>
          <p className="text-muted-foreground text-sm">
            Create your first collection above to start organizing your videos.
          </p>
        </div>
      ) : (
        <div className="space-y-2" data-ocid="collections-list">
          {collections.map((col) => (
            <CollectionItem
              key={col.id.toString()}
              collection={col}
              videoCount={getVideoCount(col.id)}
              onDeleteRequest={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Delete dialog */}
      <DeleteCollectionDialog
        target={deleteTarget}
        otherCollections={otherCollections}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
