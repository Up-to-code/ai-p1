"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { ArrowLeft, Bot, Play, Save, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { Doc, Id } from "@convex/_generated/dataModel";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuthSession } from "@/domains/auth";
import { useToast } from "@/components/ui/toast";

type AgentRecord = Doc<"customAgents">;

const defaultDraft = {
  name: "Order problem analyst",
  description: "Reviews order data and returns the problems that need attention.",
  instructions:
    "Review the supplied order data carefully. Identify missing, inconsistent, risky, or blocked fields. Return a concise message with the order identifier, every problem found, and the next recommended action.",
  model: "openai/gpt-4.1-nano",
};

export function CustomAgentEditorScreen({ agentId }: { agentId?: string }) {
  const record = useQuery(
    api.customAgents.read.getMine,
    agentId ? { agentId: agentId as Id<"customAgents"> } : "skip",
  );
  if (agentId && record === undefined) {
    return <div className="h-[calc(100dvh-3.5rem)] animate-pulse bg-muted/30" />;
  }
  return (
    <CustomAgentEditorForm
      key={record ? `${record._id}:${record.draftRevision}` : "new"}
      agent={record ?? undefined}
    />
  );
}

function CustomAgentEditorForm({ agent }: { agent?: AgentRecord }) {
  const t = useTranslations("CustomAgents");
  const locale = useLocale();
  const router = useRouter();
  const toast = useToast();
  const session = useAuthSession();
  const organizationId = session.workspace.organizationId ?? "";
  const createAgent = useMutation(api.customAgents.write.create);
  const saveDraft = useMutation(api.customAgents.write.saveDraft);
  const publishAgent = useMutation(api.customAgents.write.publish);
  const archiveAgent = useMutation(api.customAgents.write.archive);
  const [name, setName] = useState(agent?.name ?? defaultDraft.name);
  const [description, setDescription] = useState(
    agent?.description ?? defaultDraft.description,
  );
  const [instructions, setInstructions] = useState(
    agent?.instructions ?? defaultDraft.instructions,
  );
  const [model, setModel] = useState(agent?.model ?? defaultDraft.model);
  const [saving, setSaving] = useState(false);

  async function persist() {
    if (!organizationId) throw new Error(t("organizationRequired"));
    let current = agent;
    if (!current) {
      current = await createAgent({
        organizationId,
        name,
        description,
      });
    }
    if (!current) throw new Error(t("saveFailed"));
    const saved = await saveDraft({
      agentId: current._id,
      name,
      description,
      instructions,
      model,
      expectedRevision: current.draftRevision,
    });
    if (!agent) router.replace(`/${locale}/ai/agents/${saved._id}`);
    return saved;
  }

  async function save() {
    setSaving(true);
    try {
      await persist();
      toast.toast({ title: t("saved"), type: "success" });
    } catch (error) {
      toast.toast({
        title: t("saveFailed"),
        description: error instanceof Error ? error.message : undefined,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  async function publish() {
    setSaving(true);
    try {
      const saved = await persist();
      await publishAgent({
        agentId: saved._id,
        expectedRevision: saved.draftRevision,
      });
      toast.toast({ title: t("published"), type: "success" });
      router.refresh();
    } catch (error) {
      toast.toast({
        title: t("publishFailed"),
        description: error instanceof Error ? error.message : undefined,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="h-[calc(100dvh-3.5rem)] overflow-y-auto bg-background">
      <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur">
        <Button
          variant="ghost"
          size="icon"
          nativeButton={false}
          aria-label={t("back")}
          render={<Link href={`/${locale}/ai/agents`} />}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Bot className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className="text-[11px] text-muted-foreground">
            {agent ? t(`status.${agent.status}`) : t("status.draft")}
          </p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          {agent?.status === "published" && (
            <Button
              variant="outline"
              size="sm"
              nativeButton={false}
              render={<Link href={`/${locale}/ai?agentId=${agent._id}`} />}
            >
              <Play className="size-4" />
              {t("testAgent")}
            </Button>
          )}
          <Button variant="outline" size="sm" disabled={saving} onClick={save}>
            <Save className="size-4" />
            {t("save")}
          </Button>
          <Button size="sm" disabled={saving} onClick={publish}>
            <Send className="size-4" />
            {t("publish")}
          </Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-5xl gap-6 px-5 py-8 lg:grid-cols-[1fr_320px]">
        <section className="space-y-5 rounded-xl border bg-card p-6">
          <div>
            <label htmlFor="agent-name" className="text-sm font-medium">
              {t("fields.name")}
            </label>
            <Input
              id="agent-name"
              className="mt-2"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="agent-description" className="text-sm font-medium">
              {t("fields.description")}
            </label>
            <Input
              id="agent-description"
              className="mt-2"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>
          <div>
            <label htmlFor="agent-instructions" className="text-sm font-medium">
              {t("fields.instructions")}
            </label>
            <Textarea
              id="agent-instructions"
              className="mt-2 min-h-72 resize-y"
              value={instructions}
              onChange={(event) => setInstructions(event.target.value)}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              {t("instructionsHelp")}
            </p>
          </div>
        </section>

        <aside className="space-y-5">
          <section className="rounded-xl border bg-card p-5">
            <h2 className="text-sm font-semibold">{t("runtime")}</h2>
            <label htmlFor="agent-model" className="mt-4 block text-xs font-medium">
              {t("fields.model")}
            </label>
            <Input
              id="agent-model"
              className="mt-2"
              value={model}
              onChange={(event) => setModel(event.target.value)}
            />
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {t("modelHelp")}
            </p>
          </section>
          {agent && (
            <section className="rounded-xl border border-destructive/30 bg-card p-5">
              <h2 className="text-sm font-semibold">{t("archiveTitle")}</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                {t("archiveDescription")}
              </p>
              <Button
                className="mt-4"
                variant="outline"
                size="sm"
                onClick={async () => {
                  await archiveAgent({ agentId: agent._id });
                  router.push(`/${locale}/ai/agents`);
                }}
              >
                {t("archive")}
              </Button>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
}
