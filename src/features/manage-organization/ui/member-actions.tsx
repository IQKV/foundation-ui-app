import { ActionIcon, Menu, Modal, Stack, Button, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconDotsVertical,
  IconUserMinus,
  IconShieldCheck,
  IconBan,
  IconUserCheck,
  IconUserStar,
} from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import { useRemoveMember } from "../model/use-members";
import type { TenantMember } from "@/shared/api";
import { BanMemberModal, UnbanMemberModal } from "@/features/ban-user";
import { UpdateMemberAuthoritiesModal, TransferOwnershipModal } from "@/features/member-role";

interface MemberActionsProps {
  tenantKey: string;
  member: TenantMember;
  isSelf: boolean;
}

export function MemberActions({ tenantKey, member, isSelf }: MemberActionsProps) {
  const [removeModalOpened, { open: openRemoveModal, close: closeRemoveModal }] =
    useDisclosure(false);
  const [banModalOpened, { open: openBanModal, close: closeBanModal }] = useDisclosure(false);
  const [unbanModalOpened, { open: openUnbanModal, close: closeUnbanModal }] = useDisclosure(false);
  const [updateRoleModalOpened, { open: openUpdateRoleModal, close: closeUpdateRoleModal }] =
    useDisclosure(false);
  const [
    transferOwnershipModalOpened,
    { open: openTransferOwnershipModal, close: closeTransferOwnershipModal },
  ] = useDisclosure(false);

  const removeMember = useRemoveMember(tenantKey);

  const handleRemoveMember = () => {
    removeMember.mutate(member.id, {
      onSuccess: () => closeRemoveModal(),
    });
  };

  if (isSelf) return null;

  return (
    <>
      <Menu shadow="md" width={220} position="bottom-end">
        <Menu.Target>
          <ActionIcon variant="subtle" color="gray">
            <IconDotsVertical size={16} />
          </ActionIcon>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Label>
            <Trans>Actions</Trans>
          </Menu.Label>
          <Menu.Item leftSection={<IconShieldCheck size={14} />} onClick={openUpdateRoleModal}>
            <Trans>Change Role</Trans>
          </Menu.Item>
          <Menu.Item leftSection={<IconUserStar size={14} />} onClick={openTransferOwnershipModal}>
            <Trans>Transfer Ownership</Trans>
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item color="red" leftSection={<IconBan size={14} />} onClick={openBanModal}>
            <Trans>Ban Member</Trans>
          </Menu.Item>
          <Menu.Item
            color="green"
            leftSection={<IconUserCheck size={14} />}
            onClick={openUnbanModal}
          >
            <Trans>Unban Member</Trans>
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

      <BanMemberModal
        member={member}
        tenantKey={tenantKey}
        opened={banModalOpened}
        onClose={closeBanModal}
      />

      <UnbanMemberModal
        member={member}
        tenantKey={tenantKey}
        opened={unbanModalOpened}
        onClose={closeUnbanModal}
      />

      <UpdateMemberAuthoritiesModal
        member={member}
        tenantKey={tenantKey}
        opened={updateRoleModalOpened}
        onClose={closeUpdateRoleModal}
      />

      <TransferOwnershipModal
        member={member}
        tenantKey={tenantKey}
        opened={transferOwnershipModalOpened}
        onClose={closeTransferOwnershipModal}
      />
    </>
  );
}
