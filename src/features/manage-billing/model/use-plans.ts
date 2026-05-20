import { useQuery } from "@tanstack/react-query";
import { billingApi } from "@/shared/api";

export function usePlans() {
  return useQuery({
    queryKey: ["billing", "plans"],
    queryFn: () => billingApi.listPlans(),
  });
}
