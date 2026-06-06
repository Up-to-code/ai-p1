import { expectTypeOf, describe, it } from "vitest";
import type { AgUiConversationTurn, agUiConversationTurnSchema } from "../protocol";

describe("AG UI contract", () => {
  it("keeps the schema-inferred turn assignable to the public package turn", () => {
    expectTypeOf<typeof agUiConversationTurnSchema._type>().toMatchTypeOf<AgUiConversationTurn>();
  });
});
