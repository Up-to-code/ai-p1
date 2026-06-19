type LexicalNode = {
  type?: string;
  text?: string;
  children?: LexicalNode[];
  tag?: string;
  listType?: string;
  value?: string;
  src?: string;
  alt?: string;
  width?: string;
  height?: string;
};

type LexicalRoot = {
  root: LexicalNode;
};

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderNode(node: LexicalNode): string {
  if (node.type === "text") {
    let text = escapeHtml(node.text || "");
    return text;
  }

  const children = (node.children || []).map(renderNode).join("");

  switch (node.type) {
    case "paragraph":
      return `<p>${children}</p>`;
    case "heading": {
      const tag = node.tag || "h2";
      return `<${tag}>${children}</${tag}>`;
    }
    case "list": {
      const listTag = node.listType === "number" ? "ol" : "ul";
      return `<${listTag}>${children}</${listTag}>`;
    }
    case "listitem":
      return `<li>${children}</li>`;
    case "quote":
      return `<blockquote>${children}</blockquote>`;
    case "code":
      return `<pre><code>${escapeHtml(node.text || "")}</code></pre>`;
    case "link":
      return `<a href="${escapeHtml(node.value || "#")}">${children}</a>`;
    case "linebreak":
      return "<br />";
    case "upload":
      if (node.src) {
        return `<img src="${escapeHtml(node.src)}" alt="${escapeHtml(node.alt || "")}" width="${node.width || ""}" height="${node.height || ""}" />`;
      }
      return "";
    default:
      return children;
  }
}

export function lexicalToHtml(lexical: LexicalRoot | Record<string, unknown> | null | undefined): string {
  if (!lexical) return "";
  if (typeof lexical === "string") return lexical;

  const root = (lexical as LexicalRoot).root;
  if (!root) return "";

  return renderNode(root);
}
