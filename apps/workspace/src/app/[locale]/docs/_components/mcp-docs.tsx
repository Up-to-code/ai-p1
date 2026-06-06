"use client";

import { ChevronRight, FileText, Languages, Search, Copy, Check } from "lucide-react";
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";

import { CodeBlockCode } from "@/components/ui/code-block";
import { Link } from "@/i18n/routing";
import { cn } from "@/lib/utils";
import type { DocsTopicSlug, DocData } from "./mcp-docs-shared";

export type { DocsTopicSlug } from "./mcp-docs-shared";

function topicHref(slug: DocsTopicSlug) {
  return slug === "overview" ? "/docs" : `/docs/${slug}`;
}

function CodeBlockWithCopy({ children, language }: { children: string; language: string }) {
  const [copied, setCopied] = useState(false);
  const displayLanguage = language || "text";

  const handleCopy = () => {
    navigator.clipboard.writeText(children);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="not-prose group relative my-5 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border bg-muted/40 px-4 py-2 font-mono text-[10px] text-muted-foreground">
        <span className="font-bold uppercase tracking-wider">{displayLanguage}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-[9px] font-bold text-muted-foreground transition hover:bg-muted hover:text-foreground"
          aria-label={copied ? "Code copied" : "Copy code"}
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-primary animate-pulse" />
              <span className="text-primary font-bold">COPIED</span>
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              <span>COPY</span>
            </>
          )}
        </button>
      </div>
      <CodeBlockCode
        code={children}
        language={displayLanguage}
        className="max-h-[520px] text-[12px] leading-6 [&_code]:font-mono [&_pre]:m-0 [&_pre]:min-w-max"
      />
    </div>
  );
}

export function McpDocsPage({
  locale,
  topicSlug,
  currentDoc,
  sidebarTopics,
}: {
  locale: string;
  topicSlug: DocsTopicSlug;
  currentDoc: DocData;
  sidebarTopics: DocData[];
}) {
  const isArabic = locale === "ar";
  
  // Visual text copies based on language
  const copies = {
    badge: isArabic ? "التوثيق العام" : "Public documentation",
    sidebarTitle: isArabic ? "التوثيق" : "Documentation",
    search: isArabic ? "ابحث عن موضوع..." : "Find a topic...",
    language: isArabic ? "اللغة" : "Language",
    dashboard: isArabic ? "فتح لوحة التحكم" : "Open dashboard",
  };

  return (
    <main
      dir={isArabic ? "rtl" : "ltr"}
      className={cn(
        "min-h-screen bg-background text-foreground antialiased relative transition-colors duration-300",
        isArabic ? "font-cairo" : "font-sans"
      )}
    >
      
      {/* Clean Premium System Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 px-4 backdrop-blur-md lg:px-8">
        <div className="flex h-16 w-full items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5 text-sm font-semibold transition hover:opacity-90">
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <FileText className="h-4 w-4" />
            </span>
            <span className="font-extrabold tracking-tight text-foreground">{copies.sidebarTitle}</span>
          </Link>

          {/* Search container - matching system design */}
          <div className="hidden h-9 min-w-0 max-w-md flex-1 items-center gap-2 rounded-xl border border-border bg-muted/40 px-3.5 text-sm text-muted-foreground md:flex transition-all duration-200 focus-within:border-primary/20 focus-within:bg-muted/80">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground/60" />
            <span className="truncate text-muted-foreground/50">{copies.search}</span>
            <kbd className="ms-auto rounded-lg border border-border bg-card px-1.5 py-0.5 text-[9px] font-bold tracking-widest text-muted-foreground/40">/</kbd>
          </div>

          <nav className="ms-auto flex items-center gap-3">
            <span className="hidden items-center gap-2 text-xs font-semibold text-muted-foreground sm:flex">
              <Languages className="h-3.5 w-3.5 text-muted-foreground/60" />
              {copies.language}
            </span>
            <Link
              href={topicHref(topicSlug)}
              locale="en"
              className={cn(
                "rounded-lg px-2.5 py-1.5 text-xs font-bold transition",
                locale === "en" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              EN
            </Link>
            <Link
              href={topicHref(topicSlug)}
              locale="ar"
              className={cn(
                "rounded-lg px-2.5 py-1.5 text-xs font-bold transition",
                locale === "ar" ? "bg-foreground text-background shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              عربي
            </Link>
            <Link
              href="/sign-in"
              className="hidden rounded-xl border border-border bg-muted/50 px-4 py-2 text-xs font-bold text-foreground transition hover:bg-muted sm:inline-flex"
            >
              {copies.dashboard}
            </Link>
          </nav>
        </div>
      </header>

      {/* Docs Body Layout: Clean 2 Columns (Sidebar | Content) */}
      <div className="grid min-h-[calc(100vh-4rem)] w-full grid-cols-1 lg:grid-cols-[240px_1fr] xl:grid-cols-[260px_1fr] relative z-10">
        
        {/* Left Navigation Sidebar */}
        <aside className="hidden border-e border-border bg-card/30 px-5 py-8 lg:block backdrop-blur-sm">
          <div className="sticky top-24 space-y-6">
            <div>
              <p className="mb-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">{copies.sidebarTitle}</p>
              <nav className="space-y-1.5">
                {sidebarTopics.map((item) => (
                  <Link
                    key={item.slug}
                    href={topicHref(item.slug)}
                    className={cn(
                      "flex items-center justify-between rounded-xl px-3.5 py-2 text-xs font-bold transition border",
                      item.slug === topicSlug
                        ? "bg-primary/10 text-primary border-primary/20"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground border-transparent"
                    )}
                  >
                    <span className="truncate">{item.label}</span>
                    <ChevronRight className={cn(
                      "h-3.5 w-3.5 shrink-0 transition-transform", 
                      item.slug === topicSlug ? "text-primary translate-x-0.5" : "text-muted-foreground/40", 
                      isArabic && "rotate-180"
                    )} />
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Center Content Column (Simple full width - no right column) */}
        <div className="grid grid-cols-1">
          {/* Main Article column */}
          <article className="min-w-0 bg-transparent px-4 py-8 sm:px-6 md:px-8 lg:px-12 xl:px-16 max-w-4xl">
            {/* Mobile Layout Tabs */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-none lg:hidden border-b border-border">
              {sidebarTopics.map((item) => (
                <Link
                  key={item.slug}
                  href={topicHref(item.slug)}
                  className={cn(
                    "shrink-0 rounded-xl border px-3.5 py-2 text-xs font-bold transition",
                    item.slug === topicSlug
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>

            {/* Clean, Simple Document Header */}
            <section className="border-b border-border pb-6 mb-8">
              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                  {copies.badge}
                </span>
                <span className="inline-flex items-center rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  MCP Workspace
                </span>
              </div>
              <h1 className={cn("mt-4 text-3xl font-extrabold tracking-tight text-foreground md:text-4xl", isArabic ? "font-cairo" : "font-sans")}>
                {currentDoc.title}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                {currentDoc.description}
              </p>
            </section>

            {/* Render Markdown Content with System Styling */}
            <div className={cn("prose prose-zinc dark:prose-invert max-w-none min-w-0", isArabic ? "font-cairo" : "font-sans")}>
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeRaw]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="mt-8 mb-4 text-xl font-extrabold tracking-tight text-foreground md:text-2xl border-b border-border pb-3">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="mt-8 mb-4 text-base font-bold tracking-tight text-foreground border-b border-border pb-2">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="mt-6 mb-3 text-sm font-bold tracking-tight text-foreground">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="mt-4 text-[13px] font-medium leading-relaxed text-foreground/90">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="mt-4 space-y-2 list-disc list-inside text-foreground/90 text-[13px] font-medium leading-relaxed">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mt-4 space-y-2 list-decimal list-inside text-foreground/90 text-[13px] font-medium leading-relaxed">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="marker:text-primary leading-relaxed">
                      {children}
                    </li>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline font-bold transition duration-150 inline-flex items-center gap-0.5"
                    >
                      {children}
                    </a>
                  ),
                  table: ({ children }) => (
                    <div className="my-6 overflow-x-auto rounded-xl border border-border bg-card/60">
                      <table className="w-full text-left text-[12px] text-foreground/90 border-collapse">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="bg-muted/40 text-[9px] font-bold uppercase tracking-widest text-muted-foreground border-b border-border">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="divide-y divide-border bg-card/30">{children}</tbody>
                  ),
                  tr: ({ children }) => (
                    <tr className="hover:bg-muted/10 transition-colors duration-150 odd:bg-muted/5">{children}</tr>
                  ),
                  th: ({ children }) => (
                    <th className="px-4 py-2.5 font-bold text-foreground">{children}</th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-3 font-medium text-muted-foreground">{children}</td>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="my-6 border-s-4 border-primary bg-primary/5 px-4 py-2.5 rounded-e-xl text-foreground font-medium italic">
                      {children}
                    </blockquote>
                  ),
                  code: ({ className, children }) => {
                    const match = /language-(\w+)/.exec(className || "");
                    const isInline = !match;
                    
                    if (isInline) {
                      return (
                        <code className="rounded-lg border border-border bg-muted/60 px-1.5 py-0.5 font-mono text-[11px] text-foreground">
                          {children}
                        </code>
                      );
                    }
                    
                    // Render custom code block with copy button
                    return (
                      <CodeBlockWithCopy 
                        language={match[1]} 
                        children={String(children).replace(/\n$/, "")} 
                      />
                    );
                  },
                }}
              >
                {currentDoc.content}
              </ReactMarkdown>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
