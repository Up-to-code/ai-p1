import { AppRouteLoading } from "./workspace-route-loading/app-route-loading";
import { AuthRouteLoading } from "./workspace-route-loading/auth-route-loading";
import { ChooseOrganizationRouteLoading } from "./workspace-route-loading/choose-organization-route-loading";
import { OnboardingRouteLoading } from "./workspace-route-loading/onboarding-route-loading";
import { SessionCheckLoading } from "./workspace-route-loading/session-check-loading";
import type { WorkspaceRouteLoadingProps } from "./workspace-route-loading/types";

export function WorkspaceRouteLoading({ variant = "app", authMode = "sign-in" }: WorkspaceRouteLoadingProps) {
  if (variant === "session") return <SessionCheckLoading />;
  if (variant === "auth") return <AuthRouteLoading mode={authMode} />;
  if (variant === "onboarding") return <OnboardingRouteLoading />;
  if (variant === "choose-org") return <ChooseOrganizationRouteLoading />;
  return <AppRouteLoading />;
}

export type { AuthRouteLoadingMode, WorkspaceRouteLoadingProps, WorkspaceRouteLoadingVariant } from "./workspace-route-loading/types";
