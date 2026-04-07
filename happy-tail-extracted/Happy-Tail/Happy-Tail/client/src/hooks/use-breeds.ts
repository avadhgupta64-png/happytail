import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InsertBreed } from "@shared/schema";

export function useBreeds() {
  return useQuery({
    queryKey: [api.breeds.list.path],
    queryFn: async () => {
      const res = await fetch(api.breeds.list.path);
      if (!res.ok) throw new Error("Failed to fetch breeds");
      return api.breeds.list.responses[200].parse(await res.json());
    },
  });
}

export function useBreed(id: number) {
  return useQuery({
    queryKey: [api.breeds.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.breeds.get.path, { id });
      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error("Failed to fetch breed");
      }
      return api.breeds.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

// Mostly for seeding/admin usage
export function useCreateBreed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertBreed) => {
      const res = await fetch(api.breeds.create.path, {
        method: api.breeds.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create breed");
      return api.breeds.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.breeds.list.path] });
    },
  });
}
