export type MobileEnvironmentName = "development" | "production";

export type MobileEnvironmentConfig = {
  environment: MobileEnvironmentName;
  workspaceApiUrl: string;
  authUrl: string;
};

type Env = Record<string, string | undefined>;

export function normalizeUrlEnvValue(value: string | undefined): string;
export function resolveMobileEnvironmentName(env?: Env): MobileEnvironmentName;
export function resolveMobileEnvironmentConfig(env?: Env): MobileEnvironmentConfig;
export function resolveReachableDevUrl(value: string, hostUri?: string): string;
export function isLocalUrl(value: string): boolean;
export function isHttpsUrl(value: string): boolean;
export function getMobileEnvironmentIssues(config: MobileEnvironmentConfig): string[];
