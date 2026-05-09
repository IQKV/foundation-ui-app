import { Group, Title, Breadcrumbs, Anchor, Text, Stack } from "@mantine/core";
import { Link } from "@tanstack/react-router";

export interface BreadcrumbItem {
  label: string;
  /** If omitted the item renders as plain text (current page). */
  to?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  /** Optional toolbar row rendered below the title/breadcrumb line. */
  toolbar?: React.ReactNode;
}

export function PageHeader({ title, breadcrumbs, toolbar }: PageHeaderProps) {
  return (
    <Stack gap={0} mb="lg">
      {/* Title row */}
      <Group
        justify="space-between"
        align="center"
        py="md"
        style={{
          borderBottom: toolbar ? "none" : "1px solid var(--mantine-color-gray-2)",
        }}
      >
        <Title order={2} fw={700} size="h3">
          {title}
        </Title>

        {breadcrumbs && breadcrumbs.length > 0 && (
          <Breadcrumbs
            separator="/"
            separatorMargin={6}
            styles={{
              separator: { color: "var(--mantine-color-gray-4)", fontSize: 13 },
            }}
          >
            {breadcrumbs.map((crumb, i) =>
              crumb.to ? (
                <Anchor
                  key={i}
                  component={Link}
                  to={crumb.to}
                  size="sm"
                  c="dimmed"
                  style={{ textDecoration: "none" }}
                  styles={{ root: { "&:hover": { color: "var(--mantine-color-blue-6)" } } }}
                >
                  {crumb.label}
                </Anchor>
              ) : (
                <Text key={i} size="sm" c="dark" fw={500}>
                  {crumb.label}
                </Text>
              ),
            )}
          </Breadcrumbs>
        )}
      </Group>

      {/* Optional toolbar row */}
      {toolbar && (
        <Group
          py="sm"
          style={{ borderBottom: "1px solid var(--mantine-color-gray-2)" }}
        >
          {toolbar}
        </Group>
      )}
    </Stack>
  );
}
