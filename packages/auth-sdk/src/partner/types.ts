export type QentrahPartnerTokenSet = {
  accessToken: string;
  tokenType: "Bearer" | string;
  expiresIn?: number;
  refreshToken?: string;
  scope?: string;
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
