import { describe, expect, it } from "vitest";
import type { MessageMention } from "../types/inbox.types";
import {
  appendComposerMention,
  getYooptaJsonMentions,
} from "./message-composer";

describe("message composer mentions", () => {
  const mention: MessageMention = {
    id: "user-1",
    name: "Sam Example",
    type: "user",
  };

  it("creates a complete serialized mention instead of a raw at sign", () => {
    expect(appendComposerMention("", mention)).toBe(
      '<p><span data-mention data-mention-id="user-1" data-mention-name="Sam Example" data-mention-avatar="" data-mention-type="user">@Sam Example</span>&nbsp;</p>',
    );
  });

  it("inserts the mention into the active final paragraph", () => {
    const result = appendComposerMention("<p>Hello </p>", mention);
    expect(result).toContain("Hello <span data-mention");
    expect(result.endsWith("</p>")).toBe(true);
  });

  it("escapes mention data before inserting HTML", () => {
    const result = appendComposerMention("", {
      ...mention,
      name: 'Sam <script> & "Team"',
    });
    expect(result).not.toContain("<script>");
    expect(result).toContain("Sam &lt;script&gt; &amp; &quot;Team&quot;");
  });

  it("extracts mentions selected through Yoopta's typed-at picker", () => {
    const serialized = JSON.stringify({
      blocks: [{
        value: [{
          children: [
            { text: "hello " },
            {
              type: "mention",
              props: { id: "user-2", name: "Lee", type: "user" },
              children: [{ text: "" }],
            },
          ],
        }],
      }],
    });

    expect(getYooptaJsonMentions(serialized)).toEqual([
      { id: "user-2", name: "Lee", type: "user" },
    ]);
  });
});
