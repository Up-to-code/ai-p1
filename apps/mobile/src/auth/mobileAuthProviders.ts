import { mobileSocialProviders, type MobileSocialProvider } from "@/auth/socialAuth";

export type MobileAuthProviderPresentation = {
  provider: MobileSocialProvider;
};

export function resolveMobileAuthProviders(): MobileAuthProviderPresentation[] {
  return mobileSocialProviders.map((provider) => ({ provider }));
}
