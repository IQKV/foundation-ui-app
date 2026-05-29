import { useMutation, useQueryClient } from "@tanstack/react-query";
import { iamApi } from "@/shared/api";
import axios from "axios";

interface UseAvatarUploadOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useAvatarUpload({ onSuccess, onError }: UseAvatarUploadOptions = {}) {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      // Step 1: Initiate upload
      const init = await iamApi.initiateAvatarUpload();

      // Step 2: Upload file to presigned URL
      await axios.put(init.presignedUploadUrl, file, {
        headers: { "Content-Type": file.type },
      });

      // Step 3: Confirm upload
      const confirm = await iamApi.confirmAvatarUpload({ objectKey: init.objectKey });
      return confirm.avatarUrl;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error as Error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await iamApi.deleteAvatar();
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["me"] });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(error as Error);
    },
  });

  return {
    upload: (file: File) => uploadMutation.mutate(file),
    delete: () => deleteMutation.mutate(),
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
