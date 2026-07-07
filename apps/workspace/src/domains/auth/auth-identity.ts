"use client";

import { useMemo } from "react";
import { useConvexAuth, useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { authClient } from "@/lib/auth-client";
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
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const convexAuth = useConvexAuth();
  const userProfile = useQuery(api.userProfiles.read.getCurrent, convexAuth.isAuthenticated ? {} : "skip");

  const isSessionPending = sessionPending;
  const isConvexAuthenticated = convexAuth.isAuthenticated;
  const isConvexAuthPending = !convexAuth.isLoading && session?.user ? false : convexAuth.isLoading;

  const sessionStatus = useMemo(() => {
    if (isSessionPending) return "loading";
    if (!session?.user) return "unauthenticated";
    if (isConvexAuthenticated) return "authenticated";
    return "loading";
  }, [isSessionPending, session?.user, isConvexAuthenticated]);

  return useMemo(() => {
    const authUser = session?.user;
    const userName =
      userProfile?.name?.trim() ||
      authUser?.name?.trim() ||
      authUser?.email ||
      "Workspace user";
    const userEmail = authUser?.email ?? "";

    return {
      status: sessionStatus,
      isPending: isSessionPending,
      isSignedIn: Boolean(session?.user),
      user: {
        id: authUser?.id ?? "",
        name: userName,
        email: userEmail,
        image: userProfile?.avatarUrl ?? authUser?.image ?? null,
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
    session?.user?.id,
    session?.user?.name,
    session?.user?.email,
    session?.user?.image,
    userProfile?.name,
    userProfile?.avatarUrl,
    userProfile?.phone,
    userProfile?.role,
    userProfile?.language,
    userProfile?.timezone,
    userProfile?.notifications,
  ]);
}
