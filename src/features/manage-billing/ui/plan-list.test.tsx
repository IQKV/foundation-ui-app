import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { renderWithProviders } from "@/shared/ui/test-utils";
import type { Plan } from "@/shared/api";
import { PlanList } from "./plan-list";
import { usePlans } from "../model/use-plans";

vi.mock("../model/use-plans", () => ({
  usePlans: vi.fn(),
}));

const makePlan = (planCode: string, scope: "TENANT" | "USER"): Plan => ({
  id: planCode,
  planCode,
  displayName: planCode,
  billingPeriod: "MONTHLY",
  priceMinor: 1000,
  currency: "USD",
  entitlement: JSON.stringify({ maxUsers: 5, maxProjects: 5, features: {} }),
  scope,
  active: true,
});

const mockUsePlans = vi.mocked(usePlans);

describe("PlanList", () => {
  beforeEach(() => {
    mockUsePlans.mockReturnValue({
      data: [makePlan("tenant-plan", "TENANT"), makePlan("user-plan", "USER")],
      isLoading: false,
      isError: false,
    } as unknown as ReturnType<typeof usePlans>);
  });

  it("shows only USER-scoped plans for a personal workspace", async () => {
    await renderWithProviders(<PlanList personal />);

    await waitFor(() => {
      expect(screen.getByTestId("plan-card-user-plan")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("plan-card-tenant-plan")).not.toBeInTheDocument();
  });

  it("shows only TENANT-scoped plans for a tenant", async () => {
    await renderWithProviders(<PlanList personal={false} />);

    await waitFor(() => {
      expect(screen.getByTestId("plan-card-tenant-plan")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("plan-card-user-plan")).not.toBeInTheDocument();
  });
});
