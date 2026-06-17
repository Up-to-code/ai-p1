import { cn } from "@/lib/utils"
import { marked } from "marked"
import { memo, useId, useMemo, type HTMLAttributes } from "react"
import ReactMarkdown, { Components } from "react-markdown"
import remarkBreaks from "remark-breaks"
import remarkGfm from "remark-gfm"
import { CodeBlock, CodeBlockCode } from "./code-block"

type MarkdownProps = {
  children: string
  id?: string
  className?: string
  components?: Partial<Components>
} & Omit<HTMLAttributes<HTMLDivElement>, "children">

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown)
  return tokens.map((token) => token.raw)
}

function extractLanguage(className?: string): string {
  if (!className) return "plaintext"
  const match = className.match(/language-(\w+)/)
  return match ? match[1] : "plaintext"
}

const INITIAL_COMPONENTS: Partial<Components> = {
  code: function CodeComponent({ className, children, ...props }) {
    const isInline =
      !props.node?.position?.start.line ||
      props.node?.position?.start.line === props.node?.position?.end.line

    if (isInline) {
      return (
        <span
          dir="auto"
          className={cn(
            "rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-[0.9em] text-foreground",
            className
          )}
          {...props}
        >
          {children}
        </span>
      )
    }

    const language = extractLanguage(className)

    return (
      <CodeBlock className={className}>
        <CodeBlockCode code={children as string} language={language} />
      </CodeBlock>
    )
  },
  pre: function PreComponent({ children }) {
    return <>{children}</>
  },
  table: function TableComponent({ children, node, className, ...props }) {
    void node

    return (
      <div
        data-markdown-table-scroll=""
        className="not-prose my-4 block w-full max-w-full overflow-x-auto overscroll-x-contain rounded-xl border border-border bg-card shadow-sm"
        tabIndex={0}
      >
        <table
          dir="auto"
          className={cn(
            "w-max min-w-full max-w-none table-auto border-separate border-spacing-0 text-start text-sm",
            className
          )}
          {...props}
        >
          {children}
        </table>
      </div>
    )
  },
  th: function TableHeaderComponent({ children, className, node, ...props }) {
    void node

    return (
      <th
        dir="auto"
        className={cn(
          "min-w-28 whitespace-nowrap border-b border-e border-border bg-muted px-4 py-3 text-start text-xs font-black text-foreground last:border-e-0",
          className
        )}
        {...props}
      >
        {children}
      </th>
    )
  },
  td: function TableCellComponent({ children, className, node, ...props }) {
    void node

    return (
      <td
        dir="auto"
        className={cn(
          "min-w-28 whitespace-nowrap border-b border-e border-border px-4 py-3 align-top leading-6 text-foreground last:border-e-0",
          className
        )}
        {...props}
      >
        {children}
      </td>
    )
  },
}

const MemoizedMarkdownBlock = memo(
  function MarkdownBlock({
    content,
    components = INITIAL_COMPONENTS,
  }: {
    content: string
    components?: Partial<Components>
  }) {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    )
  },
  function propsAreEqual(prevProps, nextProps) {
    return prevProps.content === nextProps.content
  }
)

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock"

function MarkdownComponent({
  children,
  id,
  className,
  components = INITIAL_COMPONENTS,
  ...props
}: MarkdownProps) {
  const generatedId = useId()
  const blockId = id ?? generatedId
  const blocks = useMemo(() => parseMarkdownIntoBlocks(children), [children])

  return (
    <div className={className} {...props}>
      {blocks.map((block, index) => (
        <MemoizedMarkdownBlock
          key={`${blockId}-block-${index}`}
          content={block}
          components={components}
        />
      ))}
    </div>
  )
}

const Markdown = memo(MarkdownComponent)
Markdown.displayName = "Markdown"

export { Markdown }
