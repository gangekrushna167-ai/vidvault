import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Film,
  FolderOpen,
  Loader2,
  LogIn,
  LogOut,
  MonitorDown,
  Tag,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../hooks/useAuth";
import { useCollections } from "../hooks/useCollections";
import { useInstallPrompt } from "../hooks/useInstallPrompt";
import { useAllTags, useVideos } from "../hooks/useVideos";

export function Sidebar() {
  const { isAuthenticated, isLoggingIn, login, logout } = useAuth();
  const { data: collections = [] } = useCollections();
  const { data: videos = [] } = useVideos();
  const allTags = useAllTags(videos);
  const { canInstall, install } = useInstallPrompt();
  const router = useRouterState();
  const navigate = useNavigate();
  const currentPath = router.location.pathname;

  const rawSearch = router.location.searchStr ?? "";
  const searchParams = new URLSearchParams(rawSearch);
  const activeCollectionId = searchParams.get("collection");
  const activeTags = searchParams.getAll("tags");

  // Tag counts
  const tagCounts = new Map<string, number>();
  for (const v of videos) {
    for (const t of v.tags ?? []) {
      tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
    }
  }

  const topTags = allTags
    .map((t) => ({ tag: t, count: tagCounts.get(t) ?? 0 }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const navItems = [
    { label: "Library", icon: Film, href: "/" },
    { label: "Collections", icon: FolderOpen, href: "/collections" },
    { label: "Upload", icon: Upload, href: "/upload" },
  ];

  return (
    <aside className="w-64 min-h-screen bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-sidebar-border">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
            <Film className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-semibold text-sidebar-foreground tracking-tight">
            VidVault
          </span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="px-3 py-4 space-y-1">
        {navItems.map(({ label, icon: Icon, href }) => {
          const isActive =
            href === "/" ? currentPath === "/" : currentPath.startsWith(href);
          return (
            <Link
              key={href}
              to={href}
              data-ocid={`nav-${label.toLowerCase()}`}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-smooth ${
                isActive
                  ? "bg-sidebar-accent text-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Collections list */}
      {isAuthenticated && collections.length > 0 && (
        <>
          <Separator className="mx-3 bg-sidebar-border" />
          <div className="px-3 py-3">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground px-3 mb-2">
              Collections
            </p>
            <ScrollArea className="max-h-40">
              <div className="space-y-0.5">
                {collections.map((col) => {
                  const isActive = activeCollectionId === col.id.toString();
                  return (
                    <Link
                      key={col.id.toString()}
                      to="/"
                      search={{ collection: col.id.toString() }}
                      data-ocid="nav-collection-item"
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-smooth truncate ${
                        isActive
                          ? "bg-sidebar-accent text-primary"
                          : "text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                      }`}
                    >
                      <FolderOpen className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{col.title}</span>
                    </Link>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        </>
      )}

      {/* Tags section */}
      {isAuthenticated && topTags.length > 0 && (
        <>
          <Separator className="mx-3 bg-sidebar-border" />
          <div className="px-3 py-3">
            <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground px-3 mb-2 flex items-center gap-1.5">
              <Tag className="w-3 h-3" />
              Tags
            </p>
            <div className="space-y-0.5">
              {topTags.map(({ tag, count }) => {
                const isActive = activeTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      navigate({
                        to: "/",
                        search: (prev) => {
                          const current = (prev as Record<string, unknown>)
                            .tags;
                          const tags = Array.isArray(current)
                            ? (current as string[])
                            : current
                              ? [current as string]
                              : [];
                          const next = isActive
                            ? tags.filter((t) => t !== tag)
                            : [...tags, tag];
                          return {
                            ...prev,
                            tags: next.length > 0 ? next : undefined,
                          };
                        },
                      })
                    }
                    data-ocid="nav-tag-item"
                    className={`w-full flex items-center justify-between gap-2.5 px-3 py-1.5 rounded-lg text-xs transition-smooth ${
                      isActive
                        ? "bg-sidebar-accent text-primary"
                        : "text-sidebar-foreground/60 hover:bg-sidebar-accent/40 hover:text-sidebar-foreground"
                    }`}
                  >
                    <span className="truncate">{tag}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Install App */}
      {canInstall && (
        <div className="px-3 pb-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
            onClick={async () => {
              const outcome = await install();
              if (outcome === "accepted") {
                toast.success("VidVault installed!", {
                  description: "You can now launch it from your home screen.",
                });
              }
            }}
            data-ocid="btn-install-app"
          >
            <MonitorDown className="w-4 h-4" />
            Install App
          </Button>
        </div>
      )}

      {/* Auth */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        {isAuthenticated ? (
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
            onClick={logout}
            data-ocid="btn-logout"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        ) : (
          <Button
            className="w-full gap-2"
            onClick={login}
            disabled={isLoggingIn}
            data-ocid="btn-login"
          >
            {isLoggingIn ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            {isLoggingIn ? "Signing in…" : "Sign In"}
          </Button>
        )}
      </div>
    </aside>
  );
}
