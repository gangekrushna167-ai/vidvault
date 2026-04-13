import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { useUIStore } from "../store/uiStore";
import { Sidebar } from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const year = new Date().getFullYear();
  const hostname = encodeURIComponent(
    typeof window !== "undefined" ? window.location.hostname : "",
  );
  const { sidebarOpen, toggleSidebar } = useUIStore();

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar — animated collapse */}
      <div
        className={`shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out ${
          sidebarOpen ? "w-64" : "w-0"
        }`}
      >
        <Sidebar />
      </div>

      {/* Toggle button — floats on the sidebar edge */}
      <button
        type="button"
        aria-label={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
        data-ocid="btn-toggle-sidebar"
        onClick={toggleSidebar}
        className={`
          fixed top-[18px] z-50 flex items-center justify-center
          w-7 h-7 rounded-full
          bg-sidebar border border-sidebar-border
          text-sidebar-foreground/70 hover:text-sidebar-foreground
          shadow-card hover:shadow-elevated
          transition-smooth
          ${sidebarOpen ? "left-[232px]" : "left-3"}
        `}
      >
        {sidebarOpen ? (
          <PanelLeftClose className="w-3.5 h-3.5" />
        ) : (
          <PanelLeftOpen className="w-3.5 h-3.5" />
        )}
      </button>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 overflow-auto">{children}</main>
        <footer className="shrink-0 border-t border-border bg-muted/40 px-6 py-3 text-center text-xs text-muted-foreground">
          © {year}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${hostname}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline transition-colors duration-200"
          >
            caffeine.ai
          </a>
        </footer>
      </div>
    </div>
  );
}
