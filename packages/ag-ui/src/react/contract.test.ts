import { expectTypeOf, describe, it } from "vitest";
import type { AgUiConversationTurn } from "../protocol";
import type { AnanProUiTurn } from "../../../../apps/web/server/contracts/ananPro";

describe("AG UI contract", () => {
  it("keeps AnanProUiTurn assignable to the package conversation turn", () => {
    expectTypeOf<AnanProUiTurn>().toMatchTypeOf<AgUiConversationTurn>();
  });
});
