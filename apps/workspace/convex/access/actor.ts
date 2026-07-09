import { ConvexError } from "convex/values";
import { authUser } from "../auth";

export type ServerActor = Readonly<{
  userId: string;
}>;

export async function requireServerActor(ctx: unknown): Promise<ServerActor> {
  const user = await authUser.safeGetAuthUser(ctx);
  if (!user) {
    throw new ConvexError({
      code: "AUTHENTICATION_REQUIRED",
      message: "Authentication is required.",
    });
  }

  return { userId: user._id };
}
