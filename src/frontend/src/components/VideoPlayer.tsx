import { Play } from "lucide-react";
import type { Video } from "../types";

interface VideoPlayerProps {
  video: Video;
}

export function VideoPlayer({ video }: VideoPlayerProps) {
  const videoUrl = video.blob.getDirectURL();
  const thumbnailUrl = video.thumbnail?.getDirectURL();

  return (
    <div
      className="relative w-full bg-black rounded-2xl overflow-hidden shadow-elevated"
      style={{ aspectRatio: "16 / 9" }}
      data-ocid="video-player-container"
    >
      {videoUrl ? (
        <video
          src={videoUrl}
          controls
          className="w-full h-full object-contain"
          poster={thumbnailUrl}
          preload="metadata"
          data-ocid="video-player"
        >
          <track kind="captions" />
        </video>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-card">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
            <Play className="w-9 h-9 text-primary fill-primary/40" />
          </div>
          <p className="text-muted-foreground text-sm tracking-wide">
            Video preview unavailable
          </p>
        </div>
      )}
    </div>
  );
}
