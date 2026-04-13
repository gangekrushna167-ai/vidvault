import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "motion/react";
import { UploadForm } from "../components/UploadForm";
import { useAuth } from "../hooks/useAuth";
import { useCollections } from "../hooks/useCollections";
import { useAddVideo } from "../hooks/useVideos";

export const Route = createFileRoute("/upload")({
  component: UploadPage,
});

function UploadPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const addVideo = useAddVideo();
  const { data: collections = [] } = useCollections();

  if (!isAuthenticated) {
    navigate({ to: "/" });
    return null;
  }

  return (
    <div className="min-h-screen bg-background" data-ocid="upload-page">
      {/* Subtle ambient glow behind the form */}
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-primary/[0.06] [mask-image:radial-gradient(ellipse_60%_40%_at_50%_0%,black_0%,transparent_70%)]"
        aria-hidden="true"
      />

      <div className="max-w-2xl mx-auto px-6 py-16">
        {/* Page header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <p className="text-xs font-mono uppercase tracking-widest text-primary/70 mb-3">
            Library
          </p>
          <h1 className="font-display text-4xl font-semibold text-foreground tracking-tight leading-tight">
            Upload Video
          </h1>
          <p className="text-muted-foreground mt-2">
            Add a new video to your collection. All formats supported.
          </p>
        </motion.div>

        {/* Form card */}
        <motion.div
          className="bg-card border border-border rounded-2xl p-8 shadow-elevated"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut", delay: 0.08 }}
        >
          <UploadForm
            collections={collections}
            isPending={addVideo.isPending}
            onSuccess={() => navigate({ to: "/" })}
            onCancel={() => navigate({ to: "/" })}
            onSubmit={(args) => addVideo.mutateAsync(args)}
          />
        </motion.div>
      </div>
    </div>
  );
}
