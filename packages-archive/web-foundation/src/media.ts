const BLOCKED_AVATAR_HOST_SUFFIXES = ["googleusercontent.com"] as const;

export function resolveAvatarImageUrl(image?: string | null): string | null {
  const value = image?.trim();
  if (!value) {
    return null;
  }

  if (value.startsWith("/") || value.startsWith("data:") || value.startsWith("blob:")) {
    return value;
  }

  try {
    const url = new URL(value);
    const hostname = url.hostname.toLowerCase();
    const isBlockedHost = BLOCKED_AVATAR_HOST_SUFFIXES.some(
      (suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`),
    );

    return isBlockedHost ? null : url.toString();
  } catch {
    return null;
  }
}

export function createDisabledUploadThingState(message: string) {
  return {
    startUpload: async () => {
      throw new Error(message);
    },
    isUploading: false,
    routeConfig: undefined,
    permittedFileInfo: undefined,
  };
}
