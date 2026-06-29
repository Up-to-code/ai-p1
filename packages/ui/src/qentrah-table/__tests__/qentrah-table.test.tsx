import { describe, expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { createElement } from "react"
import { StatusPill, AssigneeAvatar, PriorityFlag } from "../index"

describe("@qentrah/ui/qentrah-table cell renderers", () => {
  it("renders a TO DO pill for the todo status", () => {
    const html = renderToStaticMarkup(createElement(StatusPill, { status: "todo" }))
    expect(html).toContain("TO DO")
  })

  it("renders an IN PROGRESS pill for the inProgress status", () => {
    const html = renderToStaticMarkup(createElement(StatusPill, { status: "inProgress" }))
    expect(html).toContain("IN PROGRESS")
  })

  it("renders a COMPLETE pill for the done status", () => {
    const html = renderToStaticMarkup(createElement(StatusPill, { status: "done" }))
    expect(html).toContain("COMPLETE")
  })

  it("renders an assignee avatar with initials", () => {
    const html = renderToStaticMarkup(createElement(AssigneeAvatar, { name: "Ahmed Mansour" }))
    expect(html).toContain("AM")
    expect(html).toContain("Ahmed Mansour")
  })

  it("renders an unassigned avatar with the placeholder label", () => {
    const html = renderToStaticMarkup(createElement(AssigneeAvatar, { name: "" }))
    expect(html).toContain("Unassigned")
  })

  it("renders an urgent priority flag", () => {
    const html = renderToStaticMarkup(createElement(PriorityFlag, { priority: "urgent" }))
    expect(html).toContain("Urgent")
  })

  it("renders a normal priority flag without a background", () => {
    const html = renderToStaticMarkup(createElement(PriorityFlag, { priority: "normal" }))
    expect(html).toContain("Normal")
  })
})

