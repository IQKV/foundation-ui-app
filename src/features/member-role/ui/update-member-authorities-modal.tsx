import { useEffect } from "react";
import { Modal, Stack, Group, Button, Text, Divider, Radio } from "@mantine/core";
import { useForm } from "@mantine/form";
import { Trans, useLingui } from "@lingui/react/macro";
import type { TenantMember } from "@/shared/api";
import { useUpdateMemberAuthorities } from "../model";

interface UpdateMemberAuthoritiesModalProps {
  member: TenantMember | null;
  tenantKey: string;
  opened: boolean;
  onClose: () => void;
}

export function UpdateMemberAuthoritiesModal({
  member,
  tenantKey,
  opened,
  onClose,
}: UpdateMemberAuthoritiesModalProps) {
  const { t } = useLingui();

  const form = useForm({
    initialValues: {
      authority: "MEMBER" as "TENANT_OWNER" | "MEMBER",
    },
  });

  useEffect(() => {
    if (opened && member) {
      const isOwner = member.tenantAuthorities.includes("TENANT_OWNER");
      form.setValues({
        authority: isOwner ? "TENANT_OWNER" : "MEMBER",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, member]);

  const displayName = member ? `${member.firstName} ${member.lastName}`.trim() : "";

  const mutation = useUpdateMemberAuthorities({
    userId: member?.id ?? "",
    tenantKey,
    displayName,
    onSuccess: handleClose,
  });

  const handleSubmit = form.onSubmit((values) => {
    mutation.mutate({ authorities: [values.authority] });
  });

  function handleClose() {
    form.reset();
    mutation.reset();
    onClose();
  }

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Stack gap={2}>
          <Text fw={600} size="md">
            <Trans>Change Member Role</Trans>
          </Text>
          {member && (
            <Text size="xs" c="dimmed">
              {displayName} &middot; {member.email}
            </Text>
          )}
        </Stack>
      }
      size="md"
      centered
    >
      <form onSubmit={handleSubmit}>
        <Stack gap="md">
          <Radio.Group {...form.getInputProps("authority")} label={t`Select role`}>
            <Stack mt="xs">
              <Radio value="TENANT_OWNER" label={t`Tenant Owner`} />
              <Radio value="MEMBER" label={t`Member`} />
            </Stack>
          </Radio.Group>

          <Divider />

          <Group justify="flex-end" gap="sm">
            <Button
              variant="subtle"
              color="gray"
              onClick={handleClose}
              disabled={mutation.isPending}
            >
              <Trans>Cancel</Trans>
            </Button>
            <Button type="submit" color="blue" loading={mutation.isPending}>
              <Trans>Save</Trans>
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
