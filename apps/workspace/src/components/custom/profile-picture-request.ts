"use client";

import { authClient } from "@/lib/auth-client";

export type SaveProfileAvatarInput = {
  avatarUrl: string;
  avatarKey?: string;
};

async function requestProfileAvatar(input: SaveProfileAvatarInput | Record<string, never>, saveError: string) {
  const response = await fetch("/api/v1/profile/avatar", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error ?? saveError);
  }
}

export async function saveProfileAvatar(
  { avatarUrl, avatarKey }: SaveProfileAvatarInput,
  saveError: string,
) {
  await requestProfileAvatar({ avatarUrl, avatarKey }, saveError);

  const { error } = await authClient.updateUser({ image: avatarUrl });
  if (error) {
    throw new Error(error.message ?? saveError);
  }
}

export async function removeProfileAvatar(saveError: string) {
  await requestProfileAvatar({}, saveError);

  const { error } = await authClient.updateUser({ image: null });
  if (error) {
    throw new Error(error.message ?? saveError);
  }
}
