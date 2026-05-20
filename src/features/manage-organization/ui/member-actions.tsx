import { ActionIcon, Menu, Modal, Checkbox, Stack, Button, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconDotsVertical,
  IconUserEdit,
  IconUserMinus,
  IconShieldCheck,
} from "@tabler/icons-react";
import { Trans, useLingui } from "@lingui/react/macro";
import { useState } from "react";
import { useUpdateMemberAuthorities, useRemoveMember } from "../model/use-members";
import type { TenantMember } from "@/shared/api";

interface MemberActionsProps {
  tenantKey: string;
  member: TenantMember;
  isSelf: boolean;
}

export function MemberActions({ tenantKey, member, isSelf }: MemberActionsProps) {
  const { t } = useLingui();
  const [roleModalOpened, { open: openRoleModal, close: closeRoleModal }] = useDisclosure(false);
  const [removeModalOpened, { open: openRemoveModal, close: closeRemoveModal }] =
    useDisclosure(false);

  const [selectedRoles, setSelectedRoles] = useState<string[]>(member.tenantAuthorities || []);

  const updateAuthorities = useUpdateMemberAuthorities(tenantKey);
  const removeMember = useRemoveMember(tenantKey);

  const handleUpdateRoles = () => {
    updateAuthorities.mutate(
      {
        userId: member.id,
        data: { authorities: selectedRoles },
      },
      {
        onSuccess: () => closeRoleModal(),
      },
    );
  };

  const handleRemoveMember = () => {
    removeMember.mutate(member.id, {
      onSuccess: () => closeRemoveModal(),
    });
  };

  if (isSelf) return null;

  return (
    <>
      <Menu shadow="md" width={200} position="bottom-end">
        <Menu.Target>
          <ActionIcon variant="subtle" color="gray">
            <IconDotsVertical size={16} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>
            <Trans>Actions</Trans>
          </Menu.Label>
          <Menu.Item leftSection={<IconShieldCheck size={14} />} onClick={openRoleModal}>
            <Trans>Edit Roles</Trans>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item
            color="red"
            leftSection={<IconUserMinus size={14} />}
            onClick={openRemoveModal}
          >
            <Trans>Remove Member</Trans>
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Modal
        opened={roleModalOpened}
        onClose={closeRoleModal}
        title={
          <Trans>
            Edit Roles: {member.firstName} {member.lastName}
          </Trans>
        }
      >
        <Stack gap="md">
          <Checkbox.Group
            value={selectedRoles}
            onChange={setSelectedRoles}
            label={<Trans>Select authorities for this member</Trans>}
          >
            <Stack mt="xs" gap="xs">
              <Checkbox
                value="ADMIN"
                label={t`Admin`}
                description={t`Can manage members and invitations.`}
              />
              <Checkbox
                value="MEMBER"
                label={t`Member`}
                description={t`Standard organization member.`}
              />
              <Checkbox
                value="BILLING_MANAGER"
                label={t`Billing Manager`}
                description={t`Can manage subscriptions and billing settings.`}
              />
            </Stack>
          </Checkbox.Group>
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeRoleModal}>
              <Trans>Cancel</Trans>
            </Button>
            <Button onClick={handleUpdateRoles} loading={updateAuthorities.isPending}>
              <Trans>Save Roles</Trans>
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={removeModalOpened}
        onClose={closeRemoveModal}
        title={<Trans>Remove Member</Trans>}
      >
        <Stack gap="md">
          <Trans>
            Are you sure you want to remove{" "}
            <strong>
              {member.firstName} {member.lastName}
            </strong>{" "}
            from this organization? They will lose all access immediately.
          </Trans>
          <Group justify="flex-end" mt="md">
            <Button variant="subtle" onClick={closeRemoveModal}>
              <Trans>Cancel</Trans>
            </Button>
            <Button color="red" onClick={handleRemoveMember} loading={removeMember.isPending}>
              <Trans>Remove</Trans>
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
