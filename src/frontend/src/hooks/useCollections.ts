import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { Collection, DeleteCollectionStrategy } from "../types";

export function useCollections() {
  const { actor, isFetching: actorFetching } = useActor(createActor);

  return useQuery<Collection[]>({
    queryKey: ["collections"],
    queryFn: async () => {
      if (!actor) return [];
      return (
        actor as unknown as { listCollections: () => Promise<Collection[]> }
      ).listCollections();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateCollection() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation<Collection, Error, string>({
    mutationFn: async (title) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as {
          createCollection: (t: string) => Promise<Collection>;
        }
      ).createCollection(title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useRenameCollection() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, { id: bigint; title: string }>({
    mutationFn: async ({ id, title }) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as {
          renameCollection: (id: bigint, t: string) => Promise<boolean>;
        }
      ).renameCollection(id, title);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
    },
  });
}

export function useDeleteCollection() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation<
    boolean,
    Error,
    { id: bigint; strategy: DeleteCollectionStrategy }
  >({
    mutationFn: async ({ id, strategy }) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as {
          deleteCollection: (
            id: bigint,
            s: DeleteCollectionStrategy,
          ) => Promise<boolean>;
        }
      ).deleteCollection(id, strategy);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collections"] });
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}
