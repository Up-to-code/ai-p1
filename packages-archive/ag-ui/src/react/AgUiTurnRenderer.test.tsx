import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { AgUiConversationTurn } from "../protocol";
import AgUiTurnRenderer from "./AgUiTurnRenderer";

function buildTurn(): AgUiConversationTurn {
  return {
    objective: "create_project",
    targetZone: "projects",
    action: {
      id: "create_project",
      title: "إنشاء مشروع",
      zone: "projects",
      fields: ["name"],
    },
    cards: [
      {
        id: "first",
        componentId: "field_request_list",
        props: {
          title: "البيانات الناقصة",
          fields: ["السعر"],
        },
      },
      {
        id: "second",
        componentId: "missing_data_prompt",
        props: {
          prompt: "اذكر السعر",
        },
      },
    ],
    assistantText: "ابدأ بالسعر",
  };
}

describe("AgUiTurnRenderer", () => {
  it("renders known cards in order", () => {
    const markup = renderToStaticMarkup(<AgUiTurnRenderer turn={buildTurn()} />);

    expect(markup.indexOf("البيانات الناقصة")).toBeLessThan(markup.indexOf("اذكر السعر"));
  });

  it("fails safely when a card component id is unknown", () => {
    const turn = {
      ...buildTurn(),
      cards: [
        {
          id: "unknown",
          componentId: "does_not_exist" as never,
          props: {
            title: "ignored",
          },
        },
      ],
    };

    const markup = renderToStaticMarkup(<AgUiTurnRenderer turn={turn} />);

    expect(markup).toBe("<div class=\"mt-3 flex w-full max-w-[760px] flex-col gap-3\"></div>");
  });

  it("uses consumer overrides for specific card ids", () => {
    const markup = renderToStaticMarkup(
      <AgUiTurnRenderer
        turn={buildTurn()}
        components={{
          field_request_list: ({ title }) => <div data-card="custom">{String(title)}</div>,
        }}
      />,
    );

    expect(markup).toContain("data-card=\"custom\"");
    expect(markup).toContain("البيانات الناقصة");
  });

  it("dispatches host action callbacks from approval footer cards", async () => {
    const onApprove = vi.fn();
    const turn: AgUiConversationTurn = {
      objective: "publish_offer",
      targetZone: "offers",
      action: {
        id: "publish_offer",
        title: "نشر عرض",
        zone: "offers",
        fields: [],
      },
      cards: [
        {
          id: "approval",
          componentId: "approval_footer",
          props: {},
        },
      ],
      assistantText: "approve?",
    };

    const element = AgUiTurnRenderer({
      turn,
      actionHandlers: {
        byName: {
          approve: onApprove,
        },
      },
    });
    const footerElement = Array.isArray(element.props.children) ? element.props.children[0] : element.props.children;
    const footerOutput = footerElement.type(footerElement.props);
    const approveButton = Array.isArray(footerOutput.props.children)
      ? footerOutput.props.children[0]
      : footerOutput.props.children;

    await approveButton.props.onClick();

    expect(onApprove).toHaveBeenCalledWith(
      expect.objectContaining({
        actionId: "publish_offer",
        actionName: "approve",
        card: expect.objectContaining({ id: "approval" }),
      }),
    );
  });
});
