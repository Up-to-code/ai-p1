import { api } from "@convex/_generated/api";
import { fetchAuthMutation } from "@/server/auth/convex-auth";
import type { UpdateProfileInput } from "../validation/update-profile.schema";

export function updateCurrentUserProfile(input: UpdateProfileInput) {
  return fetchAuthMutation(api.userProfiles.write.updateCurrentUserProfileFromHono, {
    input,
  });
}
