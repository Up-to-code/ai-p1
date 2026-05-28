type UserIdentity = {
  name?: string | null;
  email?: string | null;
  image?: string | null;
};

export function userDisplayName(user: UserIdentity | null | undefined, fallback = "Qentrah user") {
  return user?.name ?? user?.email ?? fallback;
}

export function userInitials(value: string, fallback = "Q") {
  const initials = value
    .split(" ")
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2);
  return initials || fallback;
}

export function userAvatarPresentation(user: UserIdentity | null | undefined, fallback = "Qentrah user") {
  const displayName = userDisplayName(user, fallback);
  return {
    displayName,
    avatarUrl: user?.image ?? null,
    initials: userInitials(displayName),
  };
}
