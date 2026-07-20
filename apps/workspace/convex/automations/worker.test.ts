import { describe, expect, it } from "vitest";
import {
  getGoogleSheetValues,
  renderAutomationTemplate,
  sendWhatsAppMessage,
} from "./worker";

describe("automation output templates", () => {
  it("passes published-agent output into a WhatsApp message", () => {
    expect(
      renderAutomationTemplate("Order issue: {{steps.agent.text}}", {
        payload: {},
        steps: { agent: { text: "Missing delivery address" } },
        last: { text: "Missing delivery address" },
      }),
    ).toBe("Order issue: Missing delivery address");
  });

  it("reads the configured Google Sheets range with the owner connection", async () => {
    const requests: Array<[URL | RequestInfo, RequestInit | undefined]> = [];
    const fetcher: typeof fetch = async (input, init) => {
      requests.push([input, init]);
      return Response.json({
        range: "Orders!A14:Z14",
        majorDimension: "ROWS",
        values: [["order-14", "Missing address"]],
      });
    };

    const result = await getGoogleSheetValues(
      { accessToken: "google-token" },
      "spreadsheet-id",
      "Orders!A14:Z14",
      fetcher,
    );

    expect(result.rowCount).toBe(1);
    const [requestUrl, requestInit] = requests[0]!;
    expect(String(requestUrl)).toContain(
      "spreadsheets/spreadsheet-id/values/Orders!A14%3AZ14",
    );
    expect(requestInit?.headers).toEqual({
      Authorization: "Bearer google-token",
    });
  });

  it("sends the published-agent output through WhatsApp Cloud API", async () => {
    const requests: Array<[URL | RequestInfo, RequestInit | undefined]> = [];
    const fetcher: typeof fetch = async (input, init) => {
      requests.push([input, init]);
      return Response.json({ messages: [{ id: "wamid.123" }] });
    };

    const result = await sendWhatsAppMessage(
      { accessToken: "meta-token", phoneNumberId: "phone-id" },
      "+20 100 000 0000",
      "Missing delivery address",
      fetcher,
    );

    expect(result).toEqual({
      messageId: "wamid.123",
      to: "201000000000",
    });
    const [requestUrl, requestInit] = requests[0]!;
    expect(String(requestUrl)).toContain("/phone-id/messages");
    expect(JSON.parse(String(requestInit?.body))).toMatchObject({
      to: "201000000000",
      type: "text",
      text: { body: "Missing delivery address" },
    });
  });
});
