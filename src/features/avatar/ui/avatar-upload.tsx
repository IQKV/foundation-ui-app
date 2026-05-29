import { useRef } from "react";
import { Avatar, Button, Group, Stack, ActionIcon } from "@mantine/core";
import { IconUpload, IconTrash } from "@tabler/icons-react";
import { Trans } from "@lingui/react/macro";
import { useAvatarUpload } from "../model/use-avatar-upload";
import type { UserProfile } from "@/shared/api";

interface AvatarUploadProps {
  profile: UserProfile;
}

export function AvatarUpload({ profile }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    upload,
    delete: deleteAvatar,
    isUploading,
    isDeleting,
  } = useAvatarUpload({
    onSuccess: () => {
      // Handled by query invalidation
    },
  });

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      upload(file);
    }
  };

  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();

  return (
    <Stack align="center" gap="md">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <Avatar src={profile.avatarUrl} size={120} radius="xl" color="blue">
        {initials}
      </Avatar>
      <Group gap="sm">
        <Button
          variant="light"
          leftSection={<IconUpload size={16} />}
          loading={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Trans>Upload avatar</Trans>
        </Button>
        {profile.avatarUrl && (
          <ActionIcon color="red" variant="light" loading={isDeleting} onClick={deleteAvatar}>
            <IconTrash size={16} />
          </ActionIcon>
        )}
      </Group>
    </Stack>
  );
}
