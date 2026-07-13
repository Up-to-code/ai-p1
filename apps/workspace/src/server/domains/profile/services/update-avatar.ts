import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "@/server/auth/auth-request";
import type { UpdateProfileAvatarInput } from "../validation/update-avatar.schema";

export function updateCurrentUserAvatar(input: UpdateProfileAvatarInput) {
  return fetchAuthMutation(api.userProfiles.write.updateCurrentUserAvatarFromHono, {
    input,
  });
}
