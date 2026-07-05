import { useState } from "react";
import {
  Paper,
  Stack,
  Title,
  Text,
  Table,
  Badge,
  Skeleton,
  Alert,
  Group,
  Select,
  TextInput,
  Pagination,
  Tooltip,
  Code,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconAlertCircle, IconWebhook, IconSearch } from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { dayjs } from "@/shared/lib/date-utils";
import { getWebhookLogStatusColor } from "@/shared/lib/color-utils";
import { useWebhookLogs } from "../model/use-webhook-logs";
import { TestSelectors } from "@/shared/lib/test-selectors";

const PAGE_SIZE = 10;

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSED", label: "Processed" },
  { value: "FAILED", label: "Failed" },
  { value: "IGNORED", label: "Ignored" },
];

export function WebhookLogList() {
  const { t } = useLingui();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);

  const { data, isLoading, isError } = useWebhookLogs({
    page: page - 1,
    size: PAGE_SIZE,
    sortBy: "receivedAt",
    sortDir: "desc",
    ...(debouncedSearch ? { search: debouncedSearch } : {}),
    ...(status ? { status } : {}),
  });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleStatusChange = (value: string | null) => {
    setStatus(value ?? "");
    setPage(1);
  };

  if (isLoading) {
    return (
      <Skeleton height={200} radius="md" data-testid={TestSelectors.WEBHOOK_LOG_LIST_LOADING} />
    );
  }

  if (isError) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title={<Trans>Error</Trans>}
        color="red"
        data-testid={TestSelectors.WEBHOOK_LOG_LIST_ERROR}
      >
        <Trans>Failed to load webhook log history.</Trans>
      </Alert>
    );
  }

  const logs = data?.content ?? [];
  const totalPages = data?.totalPages ?? 1;

  if (logs.length === 0 && page === 1 && !debouncedSearch && !status) {
    return null;
  }

  return (
    <Paper withBorder p="xl" radius="md" data-testid={TestSelectors.WEBHOOK_LOG_LIST}>
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <IconWebhook size={20} />
            <Title order={3}>
              <Trans>Webhook Logs</Trans>
            </Title>
          </Group>

          <Group gap="xs">
            <TextInput
              placeholder={t`Search event type…`}
              leftSection={<IconSearch size={14} />}
              value={search}
              onChange={(e) => handleSearchChange(e.currentTarget.value)}
              size="xs"
              style={{ width: 200 }}
            />
            <Select
              data={STATUS_OPTIONS}
              value={status}
              onChange={handleStatusChange}
              size="xs"
              style={{ width: 140 }}
              clearable={false}
            />
          </Group>
        </Group>

        {logs.length === 0 ? (
          <Text size="sm" c="dimmed">
            <Trans>No webhook logs found.</Trans>
          </Text>
        ) : (
          <>
            <Table verticalSpacing="sm" data-testid={TestSelectors.WEBHOOK_LOG_LIST_TABLE}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>
                    <Trans>Event Type</Trans>
                  </Table.Th>
                  <Table.Th>
                    <Trans>Status</Trans>
                  </Table.Th>
                  <Table.Th>
                    <Trans>Received At</Trans>
                  </Table.Th>
                  <Table.Th>
                    <Trans>Error</Trans>
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {logs.map((log) => (
                  <Table.Tr key={log.id} data-testid={TestSelectors.WEBHOOK_LOG_LIST_ROW(log.id)}>
                    <Table.Td data-testid={TestSelectors.WEBHOOK_LOG_LIST_ROW_EVENT_TYPE(log.id)}>
                      <Text size="sm" ff="monospace">
                        {log.eventType}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        variant="light"
                        color={getWebhookLogStatusColor(log.status)}
                        data-testid={TestSelectors.WEBHOOK_LOG_LIST_ROW_STATUS_BADGE(log.id)}
                      >
                        {log.status}
                      </Badge>
                    </Table.Td>
                    <Table.Td data-testid={TestSelectors.WEBHOOK_LOG_LIST_ROW_RECEIVED_AT(log.id)}>
                      <Text size="sm">{dayjs(log.receivedAt).format("MMM D, YYYY HH:mm")}</Text>
                    </Table.Td>
                    <Table.Td data-testid={TestSelectors.WEBHOOK_LOG_LIST_ROW_ERROR(log.id)}>
                      {log.errorMessage ? (
                        <Tooltip label={log.errorMessage} multiline maw={320} withArrow>
                          <Code
                            color="red"
                            style={{
                              cursor: "help",
                              maxWidth: 200,
                              display: "inline-block",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {log.errorMessage}
                          </Code>
                        </Tooltip>
                      ) : (
                        <Text size="sm" c="dimmed">
                          —
                        </Text>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>

            {totalPages > 1 && (
              <Group justify="center">
                <Pagination total={totalPages} value={page} onChange={setPage} size="sm" />
              </Group>
            )}
          </>
        )}
      </Stack>
    </Paper>
  );
}
