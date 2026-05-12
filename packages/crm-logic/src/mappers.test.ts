import { describe, expect, it } from "vitest";
import { buildAvatarLabel, mapClient, mapDeal } from "./mappers";

describe("@anan/crm-logic mappers", () => {
  it("builds Arabic fallback avatars", () => {
    expect(buildAvatarLabel("")).toBe("و");
    expect(buildAvatarLabel("ahmed")).toBe("A");
  });

  it("maps client records without leaking raw RED casing", () => {
    expect(mapClient({ _id: "c1", name: "Client", REDId: "red1" })).toMatchObject({
      id: "c1",
      redId: "red1",
    });
  });

  it("maps deals with nested previews", () => {
    const deal = mapDeal(
      {
        _id: "d1",
        title: "Deal",
        stage: "new",
        relationType: "broker_managed",
      },
      {
        broker: { _id: "b1", name: "Broker" },
        property: { _id: "p1", title: "Project", price: 1200000 },
      },
    );
    expect(deal.linkedBroker?.stateLabel).toBe("يدار عبر وسيط");
    expect(deal.project?.priceLabel).toBe("1,200,000 ر.س");
  });
});
