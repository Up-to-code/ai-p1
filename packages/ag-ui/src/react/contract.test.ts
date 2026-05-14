import { expectTypeOf, describe, it } from "vitest";
import type { AgUiConversationTurn } from "../protocol";
import type { QentrahProUiTurn } from "../../../../apps/web/server/contracts/qentrahPro";

describe("AG UI contract", () => {
  it("keeps QentrahProUiTurn assignable to the package conversation turn", () => {
    expectTypeOf<QentrahProUiTurn>().toMatchTypeOf<AgUiConversationTurn>();
  });
});
