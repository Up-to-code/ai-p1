export type QentrahPartnerTokenSet = {
  accessToken: string;
  tokenType: "Bearer" | string;
  expiresIn?: number;
  refreshToken?: string;
  scope?: string;
};

export type QentrahPartnerAppLifecycleStatus =
  | "draft"
  | "pending_review"
  | "active"
  | "rejected"
  | "suspended";

export type QentrahPartnerAppAuthority = {
  /**
   * Partner app id from the Partners portal. This is the canonical app id.
   */
  partnersAppId?: string;
  /**
   * OAuth client id issued in the Partners portal after app creation.
   */
  partnersClientId: string;
  /**
   * Workspace origin used only for OAuth and resource API runtime calls.
   */
  workspaceBaseUrl: string;
  /**
   * Redirect URI registered on the Partners app.
   */
  redirectUri: string;
  scopes: string[];
  status?: QentrahPartnerAppLifecycleStatus;
};

export type QentrahPartnerPendingAuthorization = {
  state: string;
  codeVerifier: string;
  redirectUri: string;
  scopes: string[];
  createdAtMs: number;
};

export type QentrahPartnerSessionStore = {
  savePendingAuthorization(input: {
    request: Request;
    pending: QentrahPartnerPendingAuthorization;
  }): Promise<void> | void;
  loadPendingAuthorization(input: {
    request: Request;
    state: string;
  }): Promise<QentrahPartnerPendingAuthorization | null> | QentrahPartnerPendingAuthorization | null;
  clearPendingAuthorization(input: {
    request: Request;
    state: string;
  }): Promise<void> | void;
};

export type QentrahPartnerTokenStore = {
  saveTokens(input: {
    request: Request;
    organizationId: string;
    tokenSet: QentrahPartnerTokenSet;
    scopes: string[];
  }): Promise<void> | void;
};

export type QentrahPartnerAuthConfig = {
  workspaceBaseUrl: string;
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
  scopes: string[];
  sessionStore: QentrahPartnerSessionStore;
  tokenStore: QentrahPartnerTokenStore;
  afterSuccessRedirect?: string;
  afterErrorRedirect?: string;
  fetcher?: typeof fetch;
};

export type QentrahPartnerEnv = {
  QENTRAH_WORKSPACE_BASE_URL?: string;
  QENTRAH_PARTNER_CLIENT_ID?: string;
  QENTRAH_PARTNER_CLIENT_SECRET?: string;
  QENTRAH_PARTNER_REDIRECT_URI?: string;
  QENTRAH_PARTNER_SCOPES?: string;
  QENTRAH_WEBHOOK_SIGNING_SECRET?: string;
};
