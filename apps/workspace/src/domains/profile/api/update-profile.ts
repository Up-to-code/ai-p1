import type { ProfileSettings } from "../store/profile.types";

export type UpdateProfileRequestInput = {
  name: string;
  phone?: string;
  role: string;
  language: "en" | "ar";
  timezone: string;
  notifications: ProfileSettings["notifications"];
};

type StoredUserProfile = {
  userId: string;
  name?: string;
  phone?: string;
  role?: string;
  language?: "en" | "ar";
  timezone?: string;
  notifications?: ProfileSettings["notifications"];
  avatarUrl?: string;
  avatarKey?: string;
  updatedAt: number;
};

export async function updateProfileRequest(
  input: UpdateProfileRequestInput,
  saveError: string,
) {
  const response = await fetch("/api/v1/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const payload = (await response.json().catch(() => ({ error: saveError }))) as {
    error?: string;
    profile?: StoredUserProfile;
  };

  if (!response.ok) {
    throw new Error(payload.error ?? saveError);
  }

  if (!payload.profile) {
    throw new Error(payload.error ?? saveError);
  }

  return payload.profile;
}
