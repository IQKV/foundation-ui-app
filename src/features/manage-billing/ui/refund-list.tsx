import { Paper, Stack, Title, Text, Table, Badge, Skeleton, Alert, Group } from "@mantine/core";
import { IconAlertCircle, IconReceiptRefund } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import dayjs from "dayjs";
import { useRefunds } from "../model/use-refunds";
import { TestSelectors } from "@/shared/lib/test-selectors";

interface RefundListProps {
  tenantKey?: string;
}

export function RefundList({ tenantKey }: RefundListProps) {
  const { data: refunds, isLoading, isError } = useRefunds(tenantKey ?? null);

  if (isLoading) {
    return <Skeleton height={200} radius="md" data-testid={TestSelectors.REFUND_LIST_LOADING} />;
  }

  if (isError) {
    return (
      <Alert
        icon={<IconAlertCircle size={16} />}
        title={<Trans>Error</Trans>}
        color="red"
        data-testid={TestSelectors.REFUND_LIST_ERROR}
      >
        <Trans>Failed to load refund history.</Trans>
      </Alert>
    );
  }

  if (!refunds || refunds.length === 0) {
    return null;
  }

  return (
    <Paper withBorder p="xl" radius="md" data-testid={TestSelectors.REFUND_LIST}>
      <Stack gap="md">
        <Group gap="xs">
          <IconReceiptRefund size={20} />
          <Title order={3}>
            <Trans>Refund History</Trans>
          </Title>
        </Group>

        <Table verticalSpacing="sm" data-testid={TestSelectors.REFUND_LIST_TABLE}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>
                <Trans>Date</Trans>
              </Table.Th>
              <Table.Th>
                <Trans>Amount</Trans>
              </Table.Th>
              <Table.Th>
                <Trans>Status</Trans>
              </Table.Th>
              <Table.Th>
                <Trans>Payment ID</Trans>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {refunds.map((refund) => (
              <Table.Tr key={refund.id} data-testid={TestSelectors.REFUND_LIST_ROW(refund.id)}>
                <Table.Td data-testid={TestSelectors.REFUND_LIST_ROW_DATE(refund.id)}>
                  {dayjs(refund.occurredAt).format("MMM D, YYYY")}
                </Table.Td>
                <Table.Td data-testid={TestSelectors.REFUND_LIST_ROW_AMOUNT(refund.id)}>
                  <Text fw={500}>
                    ${(refund.amount / 100).toFixed(2)} {refund.currency.toUpperCase()}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Badge
                    variant="light"
                    color={refund.status === "succeeded" ? "green" : "orange"}
                    data-testid={TestSelectors.REFUND_LIST_ROW_STATUS_BADGE(refund.id)}
                  >
                    {refund.status.toUpperCase()}
                  </Badge>
                </Table.Td>
                <Table.Td data-testid={TestSelectors.REFUND_LIST_ROW_PAYMENT_ID(refund.id)}>
                  <Text size="xs" c="dimmed">
                    {refund.externalPaymentId}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Stack>
    </Paper>
  );
}
