import { useQuery } from "@tanstack/react-query";
import { billingApi } from "@/shared/api";

export function useWebhookLogs(
  params: {
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
    search?: string;
    status?: string;
  } = {},
) {
  return useQuery({
    queryKey: ["billing", "webhook-logs", "me", params],
    queryFn: () => billingApi.listWebhookLogsForMe(params),
  });
}
