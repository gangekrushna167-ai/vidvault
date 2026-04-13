import {
  createActorWithConfig,
  useActor,
} from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { CreateShareLinkRequest, ShareLinkRecord, Video } from "../types";

export function useShareLinks() {
  const { actor, isFetching: actorFetching } = useActor(createActor);

  return useQuery<ShareLinkRecord[]>({
    queryKey: ["shareLinks"],
    queryFn: async () => {
      if (!actor) return [];
      return (
        actor as unknown as {
          listShareLinks: () => Promise<ShareLinkRecord[]>;
        }
      ).listShareLinks();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateShareLink() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation<ShareLinkRecord, Error, CreateShareLinkRequest>({
    mutationFn: async (req) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as {
          createShareLink: (
            r: CreateShareLinkRequest,
          ) => Promise<ShareLinkRecord>;
        }
      ).createShareLink(req);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shareLinks"] });
    },
  });
}

export function useDeleteShareLink() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: async (id) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as {
          deleteShareLink: (id: string) => Promise<boolean>;
        }
      ).deleteShareLink(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shareLinks"] });
    },
  });
}

// Public hook — uses anonymous actor directly, no auth required.
// getSharedVideos is a public endpoint so we bypass useActor's identity gate.
export function useSharedVideos(token: string) {
  return useQuery<Video[]>({
    queryKey: ["sharedVideos", token],
    queryFn: async () => {
      const anonActor = await createActorWithConfig(createActor);
      return (
        anonActor as unknown as {
          getSharedVideos: (token: string) => Promise<Video[]>;
        }
      ).getSharedVideos(token);
    },
    enabled: !!token,
  });
}
