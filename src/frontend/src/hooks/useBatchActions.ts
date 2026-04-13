import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { BatchVideoActionRequest } from "../types";

export function useBatchVideoAction() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();

  return useMutation<bigint, Error, BatchVideoActionRequest>({
    mutationFn: async (req) => {
      if (!actor) throw new Error("Actor not available");
      return (
        actor as unknown as {
          batchVideoAction: (r: BatchVideoActionRequest) => Promise<bigint>;
        }
      ).batchVideoAction(req);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });
}
