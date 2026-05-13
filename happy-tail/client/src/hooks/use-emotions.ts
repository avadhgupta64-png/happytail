import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { type AnalyzeEmotionRequest } from "@shared/schema";
import { getDeviceId } from "@/lib/device-id";
import { useLanguage } from "@/lib/language-context";

export function useEmotionHistory() {
  const deviceId = getDeviceId();
  return useQuery({
    queryKey: [api.emotions.history.path, deviceId],
    queryFn: async () => {
      const res = await fetch(`${api.emotions.history.path}?deviceId=${deviceId}`);
      if (!res.ok) throw new Error("Failed to fetch history");
      return api.emotions.history.responses[200].parse(await res.json());
    },
  });
}

export function useAnalyzeEmotion() {
  const queryClient = useQueryClient();
  const deviceId = getDeviceId();
  const { lang } = useLanguage();
  return useMutation({
    mutationFn: async (data: AnalyzeEmotionRequest) => {
      const res = await fetch(api.emotions.analyze.path, {
        method: api.emotions.analyze.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, deviceId, language: lang }),
        credentials: "include",
      });
      
      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || "Analysis failed. Please try again.");
      }
      return api.emotions.analyze.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.emotions.history.path, deviceId] });
    },
  });
}
