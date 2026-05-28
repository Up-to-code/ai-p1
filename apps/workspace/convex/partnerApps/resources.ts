import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { partnerActionValidator, partnerResourceValidator } from "./validators";
import {
  assertPartnerResourceBridgeToken,
  readPartnerResourceThroughGateway,
  writePartnerResourceThroughGateway,
} from "../partnerResourceGateway";

const PARTNER_RESOURCE_DEFAULT_LIMIT = 25;

export const read = query({
  args: {
    serverToken: v.string(),
    organizationId: v.string(),
    resource: partnerResourceValidator,
    action: partnerActionValidator,
    input: v.optional(v.any()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    assertPartnerResourceBridgeToken(args.serverToken);
    return readPartnerResourceThroughGateway(ctx, {
      organizationId: args.organizationId,
      resource: args.resource,
      action: args.action,
      input: args.input,
      defaultLimit: PARTNER_RESOURCE_DEFAULT_LIMIT,
    });
  },
});

export const write = mutation({
  args: {
    serverToken: v.string(),
    organizationId: v.string(),
    partnerAppId: v.string(),
    resource: partnerResourceValidator,
    action: partnerActionValidator,
    input: v.optional(v.any()),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    assertPartnerResourceBridgeToken(args.serverToken);
    return writePartnerResourceThroughGateway(ctx, {
      organizationId: args.organizationId,
      resource: args.resource,
      action: args.action,
      input: args.input,
      actor: {
        type: "partnerApp",
        partnerAppId: args.partnerAppId,
      },
    });
  },
});
