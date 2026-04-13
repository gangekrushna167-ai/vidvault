import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Check, Copy, Link, Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  useCreateShareLink,
  useDeleteShareLink,
  useShareLinks,
} from "../hooks/useShareLinks";
import type {
  Collection,
  CreateShareLinkRequest,
  ShareLinkRecord,
} from "../types";

interface ShareLinkModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collections: Collection[];
  allTags: string[];
}

type ScopeKind = "library" | "collection" | "tag";

function buildShareUrl(token: string): string {
  return `${window.location.origin}/shared/${token}`;
}

function scopeLabel(link: ShareLinkRecord): string {
  const s = link.scope as
    | { library: null }
    | { collection: bigint }
    | { tag: string };
  if ("library" in s) return "Entire Library";
  if ("collection" in s) return `Collection #${s.collection.toString()}`;
  if ("tag" in s) return `Tag: ${s.tag}`;
  return "Unknown";
}

export function ShareLinkModal({
  open,
  onOpenChange,
  collections,
  allTags,
}: ShareLinkModalProps) {
  const { data: links = [], isLoading } = useShareLinks();
  const createLink = useCreateShareLink();
  const deleteLink = useDeleteShareLink();

  const [scopeKind, setScopeKind] = useState<ScopeKind>("library");
  const [collectionId, setCollectionId] = useState<string>("");
  const [tagValue, setTagValue] = useState<string>("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = async () => {
    let scope: CreateShareLinkRequest["scope"];
    if (scopeKind === "library") scope = { library: null };
    else if (scopeKind === "collection") {
      if (!collectionId) {
        toast.warning("Select a collection");
        return;
      }
      scope = { collection: BigInt(collectionId) };
    } else {
      if (!tagValue) {
        toast.warning("Select a tag");
        return;
      }
      scope = { tag: tagValue };
    }
    try {
      await createLink.mutateAsync({ scope });
      toast.success("Share link created");
    } catch {
      toast.error("Failed to create share link");
    }
  };

  const handleCopy = async (token: string, id: string) => {
    await navigator.clipboard.writeText(buildShareUrl(token));
    setCopiedId(id);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    deleteLink.mutate(id, {
      onSuccess: () => toast.success("Share link deleted"),
      onError: () => toast.error("Failed to delete share link"),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-card border-border max-w-lg"
        data-ocid="share-link-modal"
      >
        <DialogHeader>
          <DialogTitle className="font-display text-xl text-foreground flex items-center gap-2">
            <Link className="w-5 h-5 text-primary" />
            Share Links
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 pt-1">
          {/* Scope selector */}
          <div className="space-y-3">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Scope
            </Label>
            <Select
              value={scopeKind}
              onValueChange={(v) => setScopeKind(v as ScopeKind)}
            >
              <SelectTrigger
                className="bg-background border-input"
                data-ocid="select-scope-kind"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="library">Entire Library</SelectItem>
                <SelectItem value="collection">Collection</SelectItem>
                <SelectItem value="tag">Tag</SelectItem>
              </SelectContent>
            </Select>

            {scopeKind === "collection" && (
              <Select value={collectionId} onValueChange={setCollectionId}>
                <SelectTrigger
                  className="bg-background border-input"
                  data-ocid="select-scope-collection"
                >
                  <SelectValue placeholder="Choose collection…" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {collections.map((col) => (
                    <SelectItem
                      key={col.id.toString()}
                      value={col.id.toString()}
                    >
                      {col.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            {scopeKind === "tag" && (
              <Select value={tagValue} onValueChange={setTagValue}>
                <SelectTrigger
                  className="bg-background border-input"
                  data-ocid="select-scope-tag"
                >
                  <SelectValue placeholder="Choose tag…" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {allTags.map((tag) => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Button
              onClick={handleCreate}
              disabled={createLink.isPending}
              className="w-full gap-2"
              data-ocid="btn-create-share-link"
            >
              {createLink.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Link className="w-4 h-4" />
              )}
              Create Share Link
            </Button>
          </div>

          <Separator />

          {/* Existing links */}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Existing Links
            </p>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : links.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No share links yet.
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto">
                {links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center gap-2 p-2.5 rounded-lg bg-background border border-border"
                    data-ocid="share-link-item"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-foreground truncate">
                        {scopeLabel(link)}
                      </p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {buildShareUrl(link.token)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                      onClick={() => handleCopy(link.token, link.id)}
                      aria-label="Copy link"
                      data-ocid="btn-copy-link"
                    >
                      {copiedId === link.id ? (
                        <Check className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(link.id)}
                      disabled={deleteLink.isPending}
                      aria-label="Delete link"
                      data-ocid="btn-delete-link"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
