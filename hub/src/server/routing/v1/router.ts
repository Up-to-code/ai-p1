import { Hono } from "hono";

export const v1Router = new Hono();

export type V1RouterType = typeof v1Router;
