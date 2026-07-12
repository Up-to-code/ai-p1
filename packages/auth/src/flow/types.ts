import type { QentrahAuthorizationEvent, QentrahAuthorizeCodeResult, QentrahTokenExchangeInput, QentrahRefreshTokenInput, QentrahRevokeTokenInput, QentrahTokenSet } from "../authorization/types.js";

export type FlowContext = {
  emit?: (event: QentrahAuthorizationEvent) => void;
};

export interface AuthFlow {
  readonly name: string;
  readonly label: string;
  authorize(options?: Record<string, unknown>): Promise<QentrahAuthorizeCodeResult>;
  exchangeCode?(input: QentrahTokenExchangeInput): Promise<QentrahTokenSet>;
  refreshToken?(input: QentrahRefreshTokenInput): Promise<QentrahTokenSet>;
  revokeToken?(input: QentrahRevokeTokenInput): Promise<void>;
}

export type FlowRegistry = {
  register(flow: AuthFlow): void;
  get(name: string): AuthFlow | undefined;
  list(): string[];
  authorize(flowName: string, options?: Record<string, unknown>): Promise<QentrahAuthorizeCodeResult>;
  exchangeCode(input: QentrahTokenExchangeInput): Promise<QentrahTokenSet>;
  refreshToken(input: QentrahRefreshTokenInput): Promise<QentrahTokenSet>;
  revokeToken(input: QentrahRevokeTokenInput): Promise<void>;
};
