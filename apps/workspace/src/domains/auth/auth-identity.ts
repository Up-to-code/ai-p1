"use client";

import { useMemo } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import {
  accountInitials,
  defaultAccountNotifications,
} from "./lib/account-normalizers";

export type NotificationPreferences = {
  product: boolean;
  approvals: boolean;
  billing: boolean;
  security: boolean;
};

export interface AuthIdentity {
  status: "loading" | "authenticated" | "unauthenticated";
  isPending: boolean;
  isSignedIn: boolean;
  user: {
    id: string;
    name: string;
    email: string;
    image: string | null;
    initials: string;
    profile: {
      phone: string;
      role: string;
      language: "en" | "ar";
      timezone: string;
      notifications: NotificationPreferences;
    };
  };
}

export function useAuthIdentity(): AuthIdentity {
  const auth = useAuth();
  const userQuery = useUser();
  const convexAuth = useConvexAuth();
  const userProfile = useQuery(api.userProfiles.read.getCurrent, convexAuth.isAuthenticated ? {} : "skip");

  const isSessionPending = !auth.isLoaded || !userQuery.isLoaded;
  const isConvexAuthenticated = convexAuth.isAuthenticated;
  const isConvexAuthPending = !convexAuth.isLoading && auth.isSignedIn ? false : convexAuth.isLoading;

  const sessionStatus = useMemo(() => {
    if (isSessionPending) return "loading";
    if (!auth.isSignedIn) return "unauthenticated";
    if (isConvexAuthenticated) return "authenticated";
    return "loading";
  }, [isSessionPending, auth.isSignedIn, isConvexAuthenticated]);

  return useMemo(() => {
    const clerkUser = userQuery.user;
    const userName =
      userProfile?.name?.trim() ||
      clerkUser?.fullName?.trim() ||
      clerkUser?.username?.trim() ||
      clerkUser?.primaryEmailAddress?.emailAddress ||
      "Workspace user";
    const userEmail = clerkUser?.primaryEmailAddress?.emailAddress ?? "";

    return {
      status: sessionStatus,
      isPending: isSessionPending,
      isSignedIn: Boolean(auth.isSignedIn),
      user: {
        id: auth.userId ?? clerkUser?.id ?? "",
        name: userName,
        email: userEmail,
        image: userProfile?.avatarUrl ?? clerkUser?.imageUrl ?? null,
        initials: accountInitials(userName),
        profile: {
          phone: userProfile?.phone ?? "",
          role: userProfile?.role ?? "Workspace Owner",
          language: userProfile?.language ?? "en",
          timezone: userProfile?.timezone ?? "Africa/Cairo",
          notifications: userProfile?.notifications ?? defaultAccountNotifications,
        },
      },
    };
  }, [
    sessionStatus,
    isSessionPending,
    auth.isLoaded,
    auth.isSignedIn,
    auth.userId,
    userQuery.isLoaded,
    userQuery.user?.id,
    userQuery.user?.fullName,
    userQuery.user?.username,
    userQuery.user?.primaryEmailAddress?.emailAddress,
    userQuery.user?.imageUrl,
    userProfile?.name,
    userProfile?.avatarUrl,
    userProfile?.phone,
    userProfile?.role,
    userProfile?.language,
    userProfile?.timezone,
    userProfile?.notifications,
  ]);
}
