export const QENTRAH_OAUTH_SCOPES = [
  "offline_access",
  "clients:read",
  "clients:create",
  "clients:update_own",
  "clients:read_own",
  "properties:read",
  "properties:create_own",
  "properties:update_own",
  "properties:delete_own",
  "properties:read_own",
] as const;

export type QentrahOAuthScope = (typeof QENTRAH_OAUTH_SCOPES)[number];

export type QentrahAuthorizationErrorCode =
  | "popup_blocked"
  | "access_denied"
  | "invalid_state"
  | "invalid_scope"
  | "inactive_client"
  | "authorization_expired"
  | "network_error"
  | "invalid_response";

export type QentrahAuthorizationClientOptions = {
  issuer: string;
  clientId: string;
  redirectUri: string;
  scopes: readonly QentrahOAuthScope[] | readonly string[];
  sourceApp?: "web" | "admin";
  popup?: {
    width?: number;
    height?: number;
    timeoutMs?: number;
  };
  onEvent?: (event: QentrahAuthorizationEvent) => void;
};

export type QentrahAuthorizeOptions = Partial<Pick<QentrahAuthorizationClientOptions, "redirectUri" | "scopes" | "sourceApp">> & {
  state?: string;
  nonce?: string;
  popup?: false | QentrahAuthorizationClientOptions["popup"];
};

export type QentrahAuthorizeUrlInput = {
  issuer: string;
  clientId: string;
  redirectUri: string;
  scopes: readonly string[];
  state: string;
  codeChallenge: string;
  nonce?: string;
  sourceApp?: "web" | "admin";
};

export type QentrahAuthorizeResult = {
  code: string;
  state: string;
  redirectUri: string;
};

export type QentrahAuthorizeCodeResult = QentrahAuthorizeResult & {
  codeVerifier: string;
};

export type QentrahTokenSet = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  refreshToken?: string;
  scope: string;
  idToken?: string;
};

export type QentrahTokenExchangeInput = {
  issuer: string;
  clientId: string;
  code: string;
  redirectUri: string;
  codeVerifier: string;
  clientSecret?: string;
};

export type QentrahRefreshTokenInput = {
  issuer: string;
  clientId: string;
  refreshToken: string;
  clientSecret?: string;
};

export type QentrahRevokeTokenInput = {
  issuer: string;
  clientId: string;
  token: string;
  clientSecret?: string;
};

export type QentrahAuthorizationServerMetadata = {
  issuer: string;
  authorization_endpoint: string;
  token_endpoint: string;
  revocation_endpoint?: string;
  jwks_uri?: string;
  response_types_supported?: string[];
  grant_types_supported?: string[];
  scopes_supported?: string[];
  code_challenge_methods_supported?: string[];
};

export type QentrahAuthorizationEvent =
  | { type: "authorize_url_created"; url: string }
  | { type: "popup_opened" }
  | { type: "popup_blocked" }
  | { type: "popup_closed" }
  | { type: "redirect_fallback"; url: string }
  | { type: "authorized"; result: QentrahAuthorizeResult };
