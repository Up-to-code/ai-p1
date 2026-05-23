import { Hono } from "hono";
import { handleTamaraWebhook } from "./handlers/billing";

export const billingRouter = new Hono();

billingRouter.post("/tamara/webhook", handleTamaraWebhook);
