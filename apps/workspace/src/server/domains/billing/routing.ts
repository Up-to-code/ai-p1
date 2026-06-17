import { Hono } from "hono";
import { handleDodoWebhook } from "./handlers/billing";

export const billingRouter = new Hono();

billingRouter.post("/dodo/webhook", handleDodoWebhook);
