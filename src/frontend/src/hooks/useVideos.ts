import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type {
  AddVideoRequest,
  UpdateVideoRequest,
  Video,
  VideoFilter,
} from "../types";

const DEFAULT_FILTER: VideoFilter = {
  sortField: { dateAdded: null },
  sortOrder: { desc: null },
};

export function useVideos(filter: Partial<VideoFilter> = {}) {
  const { actor, isFetching: actorFetching } = useActor(createActor);
  const merged: VideoFilter = { ...DEFAULT_FILTER, ...filter };

  return useQuery<Video[]>({
    queryKey: ["videos", merged],
    queryFn: async () => {
      if (!actor) return [];
      return (
        actor as unknown as { listVideos: (f: VideoFilter) => Promise<Video[]> }
      ).listVideos(merged);
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useVideo(id: bigint | null) {
  const { actor, isFetching: actorFetching } = useActor(createActor);

  return useQuery<Video | null>({
    queryKey: ["video", id?.toString()],
    queryFn: async () => {
      if (!actor || id === null) return null;
      return (
        actor as unknown as { getVideo: (id: bigint) => Promise<Video | null> }
      ).getVideo(id);
    },
    enabled: !!actor && !actorFetching && id !== null,
  });
}

export function useAddVideo() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation<Video, Error, AddVideoRequest>({
    mutationFn: async (req) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as { addVideo: (r: AddVideoRequest) => Promise<Video> }
      ).addVideo(req);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useUpdateVideo() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, UpdateVideoRequest>({
    mutationFn: async (req) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as {
          updateVideo: (r: UpdateVideoRequest) => Promise<boolean>;
        }
      ).updateVideo(req);
    },
    onSuccess: (_, req) => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
      queryClient.invalidateQueries({ queryKey: ["video", req.id.toString()] });
    },
  });
}

export function useDeleteVideo() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, bigint>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as { deleteVideo: (id: bigint) => Promise<boolean> }
      ).deleteVideo(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

export function useMoveVideo() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation<
    boolean,
    Error,
    { videoId: bigint; collectionId: bigint | null }
  >({
    mutationFn: async ({ videoId, collectionId }) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as {
          moveVideo: (v: bigint, c: bigint | null) => Promise<boolean>;
        }
      ).moveVideo(videoId, collectionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}

/** Derive a sorted list of unique tags from the videos cache */
export function useAllTags(videos: Video[]): string[] {
  const tagSet = new Set<string>();
  for (const v of videos) {
    for (const t of v.tags ?? []) tagSet.add(t);
  }
  return Array.from(tagSet).sort();
}
