import test from "node:test";
import assert from "node:assert/strict";

import { getPreparedWorkspacePrompts } from "@/conversation/components/composerPromptData";

test("composer quick prompts are scoped to Workspace AI work", () => {
  const bannedTerms = /property|properties|listing|listings|real estate|عقار|عقارات|عقاري/i;

  for (const locale of ["ar", "en", "fr"] as const) {
    const prompts = getPreparedWorkspacePrompts(locale, () => {});

    assert.ok(prompts.length >= 4);
    for (const prompt of prompts) {
      assert.doesNotMatch(`${prompt.label} ${prompt.tag}`, bannedTerms);
    }
  }
});

test("composer quick prompts write the selected Workspace AI query", () => {
  let draft = "";
  const [firstPrompt] = getPreparedWorkspacePrompts("en", (value) => {
    draft = value;
  });

  firstPrompt.onPress();

  assert.match(draft, /workspace project plan/i);
});
