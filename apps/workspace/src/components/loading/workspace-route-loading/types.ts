export type WorkspaceRouteLoadingVariant = "auth" | "app" | "onboarding" | "choose-org" | "session";

export type AuthRouteLoadingMode = "sign-in" | "sign-up";

export type WorkspaceRouteLoadingProps = {
  variant?: WorkspaceRouteLoadingVariant;
  authMode?: AuthRouteLoadingMode;
};
