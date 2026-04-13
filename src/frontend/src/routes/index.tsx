import { Button } from "@/components/ui/button";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Film, Link, Plus } from "lucide-react";
import { useState } from "react";
import { BatchActionToolbar } from "../components/BatchActionToolbar";
import { BatchTagModal } from "../components/BatchTagModal";
import {
  FilterBar,
  type SortField,
  type SortOrder,
} from "../components/FilterBar";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ShareLinkModal } from "../components/ShareLinkModal";
import { VideoGrid } from "../components/VideoGrid";
import { useAuth } from "../hooks/useAuth";
import { useCollections } from "../hooks/useCollections";
import { useAllTags, useVideos } from "../hooks/useVideos";
import type { VideoFilter } from "../types";

interface SearchParams {
  collection?: string;
  q?: string;
  sort?: SortField;
  order?: SortOrder;
  dateFrom?: string;
  dateTo?: string;
  tags?: string[];
}

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    collection:
      typeof search.collection === "string" ? search.collection : undefined,
    q: typeof search.q === "string" ? search.q : undefined,
    sort:
      search.sort === "title" ||
      search.sort === "fileSize" ||
      search.sort === "dateAdded"
        ? (search.sort as SortField)
        : undefined,
    order:
      search.order === "asc" || search.order === "desc"
        ? (search.order as SortOrder)
        : undefined,
    dateFrom: typeof search.dateFrom === "string" ? search.dateFrom : undefined,
    dateTo: typeof search.dateTo === "string" ? search.dateTo : undefined,
    tags: Array.isArray(search.tags)
      ? (search.tags as string[]).filter((t) => typeof t === "string")
      : typeof search.tags === "string"
        ? [search.tags]
        : undefined,
  }),
  component: LibraryPage,
});

function dateStringToNs(dateStr: string): bigint | null {
  if (!dateStr) return null;
  const ms = new Date(dateStr).getTime();
  if (Number.isNaN(ms)) return null;
  return BigInt(ms) * 1_000_000n;
}

function LibraryPage() {
  const { isAuthenticated, login, isLoggingIn } = useAuth();
  const { collection, q, sort, order, dateFrom, dateTo, tags } =
    Route.useSearch();
  const navigate = useNavigate({ from: "/" });
  const { data: collections = [] } = useCollections();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [batchTagOpen, setBatchTagOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const sortField = sort ?? "dateAdded";
  const sortOrder = order ?? "desc";
  const selectedTags = tags ?? [];
  const selectionMode = selectedIds.size > 0;

  const filter: Partial<VideoFilter> = {
    collectionId: collection ? BigInt(collection) : undefined,
    searchTerm: q ?? undefined,
    dateFrom: dateStringToNs(dateFrom ?? "") ?? undefined,
    dateTo: dateStringToNs(dateTo ?? "") ?? undefined,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    sortField:
      sortField === "title"
        ? { title: null }
        : sortField === "fileSize"
          ? { fileSize: null }
          : { dateAdded: null },
    sortOrder: sortOrder === "asc" ? { asc: null } : { desc: null },
  };

  const {
    data: videos = [],
    isLoading,
    isError,
    refetch,
  } = useVideos(isAuthenticated ? filter : {});

  // All tags from the unfiltered list (use no-filter query)
  const { data: allVideos = [] } = useVideos(isAuthenticated ? {} : {});
  const allTags = useAllTags(allVideos);

  const activeCollection = collections.find(
    (c) => c.id.toString() === collection,
  );
  const pageTitle = activeCollection?.title ?? "All Videos";

  const handleToggleSelect = (id: bigint) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const key = id.toString();
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelectedIds(new Set(videos.map((v) => v.id.toString())));
  };

  const handleTagToggle = (tag: string) => {
    navigate({
      search: (prev) => {
        const current = selectedTags;
        const next = current.includes(tag)
          ? current.filter((t) => t !== tag)
          : [...current, tag];
        return { ...prev, tags: next.length > 0 ? next : undefined };
      },
    });
  };

  if (!isAuthenticated) {
    return (
      <div
        className="flex-1 flex flex-col items-center justify-center min-h-screen p-8 text-center"
        data-ocid="login-screen"
      >
        <div className="mb-8">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 shadow-card">
            <Film className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-display text-4xl font-semibold text-foreground mb-3 tracking-tight">
            Your Film Library
          </h1>
          <p className="text-muted-foreground max-w-md text-base leading-relaxed">
            A private, cinematic workspace for your video collection. Sign in to
            access your library.
          </p>
        </div>
        <Button
          size="lg"
          onClick={login}
          disabled={isLoggingIn}
          className="gap-2 px-8"
          data-ocid="btn-login-hero"
        >
          {isLoggingIn && <LoadingSpinner size="sm" />}
          {isLoggingIn ? "Signing in…" : "Sign In with Internet Identity"}
        </Button>
      </div>
    );
  }

  return (
    <div className="p-8" data-ocid="library-page">
      {/* Page header */}
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-4xl font-semibold text-foreground tracking-tight mb-1">
            {pageTitle}
          </h1>
          <p className="text-muted-foreground text-sm">
            {isLoading
              ? "Loading…"
              : `${videos.length} video${videos.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-2 border-border"
            onClick={() => setShareOpen(true)}
            data-ocid="btn-share"
          >
            <Link className="w-4 h-4" />
            Share
          </Button>
          <Button asChild className="gap-2 shrink-0" data-ocid="btn-upload">
            <a href="/upload">
              <Plus className="w-4 h-4" />
              Add Video
            </a>
          </Button>
        </div>
      </div>

      {/* Batch action toolbar */}
      <BatchActionToolbar
        selectedIds={selectedIds}
        onDeselectAll={() => setSelectedIds(new Set())}
        onSelectAll={handleSelectAll}
        onTagAction={() => setBatchTagOpen(true)}
        collections={collections}
        onActionsComplete={() => setSelectedIds(new Set())}
      />

      {/* Filters */}
      <FilterBar
        searchQuery={q ?? ""}
        onSearchChange={(v) =>
          navigate({ search: (prev) => ({ ...prev, q: v || undefined }) })
        }
        sortField={sortField}
        onSortFieldChange={(v) =>
          navigate({ search: (prev) => ({ ...prev, sort: v }) })
        }
        sortOrder={sortOrder}
        onSortOrderToggle={() =>
          navigate({
            search: (prev) => ({
              ...prev,
              order: sortOrder === "asc" ? "desc" : "asc",
            }),
          })
        }
        dateFrom={dateFrom ?? ""}
        onDateFromChange={(v) =>
          navigate({
            search: (prev) => ({ ...prev, dateFrom: v || undefined }),
          })
        }
        dateTo={dateTo ?? ""}
        onDateToChange={(v) =>
          navigate({
            search: (prev) => ({ ...prev, dateTo: v || undefined }),
          })
        }
        activeCollectionId={collection}
        collections={collections}
        onCollectionChange={(id) =>
          navigate({
            search: (prev) => ({ ...prev, collection: id }),
          })
        }
        allTags={allTags}
        selectedTags={selectedTags}
        onTagToggle={handleTagToggle}
      />

      {/* Video grid */}
      <VideoGrid
        videos={videos}
        isLoading={isLoading}
        isError={isError}
        onRetry={() => refetch()}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        selectionMode={selectionMode}
      />

      {/* Batch tag modal */}
      <BatchTagModal
        open={batchTagOpen}
        onOpenChange={setBatchTagOpen}
        selectedIds={selectedIds}
        allTags={allTags}
        onComplete={() => setSelectedIds(new Set())}
      />

      {/* Share link modal */}
      <ShareLinkModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        collections={collections}
        allTags={allTags}
      />
    </div>
  );
}
