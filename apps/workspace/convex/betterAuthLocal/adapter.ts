import { createApi } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import type { BetterAuthOptions } from "better-auth/minimal";
import { organization } from "better-auth/plugins";
import schema from "./schema";

const options = {
  plugins: [
    organization({ teams: { enabled: true } }),
    convex({
      authConfig: { providers: [{ applicationID: "convex", domain: "" }] },
    }),
  ],
} as BetterAuthOptions;

export const {
  create,
  findOne,
  findMany,
  updateOne,
  updateMany,
  deleteOne,
  deleteMany,
} = createApi(schema, () => options);
