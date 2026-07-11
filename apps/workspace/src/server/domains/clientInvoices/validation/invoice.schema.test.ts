import { describe, expect, it } from "vitest";
import { invoicePayloadSchema } from "./invoice.schema";

describe("invoicePayloadSchema", () => {
  it("normalizes a valid client invoice", () => {
    expect(invoicePayloadSchema.parse({
      clientId: "client_1",
      invoiceNumber: "INV-001",
      title: "Monthly retainer",
      amount: 1250,
      currency: "usd",
      status: "sent",
      issueDate: "2026-07-11",
      dueDate: "2026-07-31",
      notes: "",
    })).toMatchObject({ currency: "USD", notes: undefined });
  });

  it("rejects negative amounts and invalid dates", () => {
    const result = invoicePayloadSchema.safeParse({
      clientId: "client_1", invoiceNumber: "INV-002", title: "Invalid",
      amount: -1, currency: "USD", status: "draft", issueDate: "today", dueDate: "later",
    });
    expect(result.success).toBe(false);
  });
});
