import type { QentrahTokenExchangeInput, QentrahRefreshTokenInput, QentrahRevokeTokenInput, QentrahTokenSet } from "../authorization/types";
import { exchangeCode as defaultExchangeCode, refreshToken as defaultRefreshToken, revokeToken as defaultRevokeToken } from "../authorization/token";
import type { AuthFlow, FlowRegistry } from "./types";

export function createFlowRegistry(defaults?: {
  exchangeCode?: (input: QentrahTokenExchangeInput) => Promise<QentrahTokenSet>;
  refreshToken?: (input: QentrahRefreshTokenInput) => Promise<QentrahTokenSet>;
  revokeToken?: (input: QentrahRevokeTokenInput) => Promise<void>;
}): FlowRegistry {
  const flows = new Map<string, AuthFlow>();
  const exchangeCode = defaults?.exchangeCode ?? defaultExchangeCode;
  const refreshToken = defaults?.refreshToken ?? defaultRefreshToken;
  const revokeToken = defaults?.revokeToken ?? defaultRevokeToken;

  return {
    register(flow) {
      flows.set(flow.name, flow);
    },
    get(name) {
      return flows.get(name);
    },
    list() {
      return [...flows.keys()];
    },
    async authorize(flowName, options) {
      const flow = flows.get(flowName);
      if (!flow) {
        throw new Error(`Unknown auth flow: ${flowName}. Registered flows: ${flows.size > 0 ? [...flows.keys()].join(", ") : "none"}`);
      }
      return flow.authorize(options);
    },
    async exchangeCode(input) {
      return exchangeCode(input);
    },
    async refreshToken(input) {
      return refreshToken(input);
    },
    async revokeToken(input) {
      return revokeToken(input);
    },
  };
}
