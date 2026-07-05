---
description: Use when creating or updating documents or task descriptions. Teaches the Tiptap rich-text format that Qentrah uses — content must be HTML, not markdown, or it will render as plain text.
---

# Tiptap Document Format

This skill applies to **documents** (via `docs-create`, `docs-update`) and **task descriptions** (via `tasks-create`, `tasks-update`).

## First rule: content must be HTML

Qentrah uses the **Tiptap rich-text editor** for documents and task descriptions. It renders **HTML**, not markdown.

If you pass markdown as the `content` field, it will be stored as-is and Tiptap will display it as **plain text with the markdown syntax visible**. Always pass HTML.

## Supported HTML elements

| Element | HTML | Notes |
|---------|------|-------|
| Heading 1 | `<h1>` | Document title equivalent — use sparingly |
| Heading 2 | `<h2>` | Main section header |
| Heading 3 | `<h3>` | Sub-section header |
| Paragraph | `<p>` | Default block |
| Bold | `<strong>` | Or `<b>` |
| Italic | `<em>` | Or `<i>` |
| Underline | `<u>` | |
| Bullet list | `<ul><li>...</li></ul>` | Unordered |
| Numbered list | `<ol><li>...</li></ol>` | Ordered |
| Blockquote | `<blockquote>` | Quoted text |
| Code block | `<pre><code>` | Multi-line code |
| Inline code | `<code>` | Single-line code |
| Link | `<a href="url">text</a>` | Opens in new tab |
| Image | `<img src="url" alt="text">` | With optional `width` attribute |
| Text align | `style="text-align: center;"` | On `p` or heading tags |
| @-mention | `<span class="mention" data-mention-type="..." data-mention-id="...">@Name</span>` | See below |

## Document structure template

When creating a document, use this structure:

```html
<h1>Document Title</h1>

<h2>Overview</h2>
<p>Brief description of what this document covers.</p>

<h2>Section 1</h2>
<p>Content of the first section.</p>

<h3>Sub-section 1.1</h3>
<p>Detailed content with <strong>bold</strong> or <em>italic</em> for emphasis.</p>
<ul>
  <li>Item one</li>
  <li>Item two</li>
</ul>

<h2>Section 2</h2>
<blockquote>
  <p>Important quote or note.</p>
</blockquote>

<pre><code>code block example</code></pre>
```

## @-mention format

To reference a workspace entity (user, client, project, task, etc.), use this HTML:

```html
<span class="mention" data-mention-type="user" data-mention-id="user_abc123">@John</span>
<span class="mention" data-mention-type="project" data-mention-id="project_abc123">@Q3 Campaign</span>
<span class="mention" data-mention-type="client" data-mention-id="client_abc123">@Acme Corp</span>
<span class="mention" data-mention-type="task" data-mention-id="task_abc123">@Review budget</span>
```

Supported mention types: `user`, `client`, `project`, `task`, `deal`, `meeting`.

## Task descriptions

Task descriptions use the **same Tiptap editor** as documents. Apply the same HTML rules when using `tasks-create` or `tasks-update` with a `description` field.

Keep task descriptions concise:
```html
<p><strong>Goal:</strong> Complete the Q3 review before the deadline.</p>
<ul>
  <li>Review all metrics</li>
  <li>Prepare summary</li>
</ul>
```

## What NOT to do

- Do NOT send raw markdown like `# Title\n\nParagraph` — it will display as plain text.
- Do NOT use markdown link syntax `[text](url)` — use `<a href="url">text</a>`.
- Do NOT use markdown `**bold**` or `*italic*` — use `<strong>` or `<em>`.
- Do NOT use `---` for horizontal rules — not supported by the editor.

## When this skill applies

- Creating or updating a document via `docs-create` / `docs-update`
- Creating or updating a task with a description via `tasks-create` / `tasks-update`
- The docs subagent and tasks subagent both need this format
