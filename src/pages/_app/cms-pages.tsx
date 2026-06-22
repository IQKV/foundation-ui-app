import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/cms-pages")({
  component: () => <Outlet />,
});
