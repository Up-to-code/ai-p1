"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useOptimisticInvalidation } from "@/domains/cache/hooks/use-optimistic-invalidation";
import { logger } from "@/lib/logger";
import { useTranslations, useLocale } from "next-intl";
import { projectSchema, type ProjectFormValues } from "../validation/project.schema";
import { useAccountContext } from "@/domains/auth";
import { createProjectRequest } from "../api/projects";
import { useRouter } from "@/i18n/routing";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { Tag, Trash2, Circle, Activity, Folder, CalendarDays, Globe, Hash } from "lucide-react";
import { CalendarDatePicker } from "@/components/ui/calendar-date-picker";
import { RecordModal } from "@/components/shared/record-modal";
import { WorkOsDocEditor, type DocEditorMetaField } from "@/components/shared/work-os-doc-editor";
import { ProjectStatusPicker, ProjectHealthPicker, ClientInlinePicker } from "./project-pickers";
import { useClientOptionsQuery } from "@/domains/clients/api/clients";

export interface CreateProjectFormProps {
  isOpen: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateProjectForm({ isOpen, onSuccess, onCancel }: CreateProjectFormProps) {
  const account = useAccountContext();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("Projects.form");
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const queryClient = useQueryClient();
  const { invalidate } = useOptimisticInvalidation();
  const organizationId = account.workspace.status === "ready" ? account.workspace.organizationId ?? undefined : undefined;
  const clientOptionsQuery = useClientOptionsQuery(organizationId);

  const form = useForm<ProjectFormValues>({
    resolver: (zodResolver as any)(projectSchema),
    defaultValues: {
      name: "",
      clientId: "",
      opportunityId: "",
      status: "planned",
      health: "onTrack",
      visibility: "team",
      startDate: "",
      endDate: "",
      budget: "",
      description: "",
      tags: [],
      templateId: "",
      useAiSetup: false,
    } as ProjectFormValues,
  });

  const tags = form.watch("tags") ?? [];
  const title = form.watch("name") ?? "";
  const description = form.watch("description") ?? "";

  function addTag() {
    const tag = tagInput.trim();
    if (!tag || tags.includes(tag)) {
      setTagInput("");
      return;
    }
    form.setValue("tags", [...tags, tag], { shouldValidate: true });
    setTagInput("");
  }

  function removeTag(tag: string) {
    form.setValue("tags", tags.filter((t) => t !== tag), { shouldValidate: true });
  }

  const fields: DocEditorMetaField[] = [
    {
      key: "status",
      icon: <Circle className="h-3.5 w-3.5" />,
      label: t("statusLabel"),
      value: (
        <ProjectStatusPicker
          value={form.watch("status") as "planned"}
          onChange={(v) => form.setValue("status", v as any)}
          labels={{
            planned: t("statusPlanned"),
            active: t("statusActive"),
            paused: t("statusPaused"),
            completed: t("statusCompleted"),
            archived: t("statusArchived"),
          }}
          tooltip={t("statusTooltip")}
        />
      ),
    },
    {
      key: "health",
      icon: <Activity className="h-3.5 w-3.5" />,
      label: t("healthLabel"),
      value: (
        <ProjectHealthPicker
          value={form.watch("health") as "onTrack"}
          onChange={(v) => form.setValue("health", v as any)}
          labels={{
            onTrack: t("healthOnTrack"),
            atRisk: t("healthAtRisk"),
            blocked: t("healthBlocked"),
          }}
          tooltip={t("healthTooltip")}
        />
      ),
    },
    {
      key: "client",
      icon: <Folder className="h-3.5 w-3.5" />,
      label: t("clientPicker.title"),
      value: (
        <ClientInlinePicker
          value={form.watch("clientId") ?? ""}
          onChange={(v) => form.setValue("clientId", v)}
          options={clientOptionsQuery ?? []}
          placeholder={t("clientPicker.selectPlaceholder")}
          searchPlaceholder={t("clientPicker.searchPlaceholder")}
          noResultsText={t("clientPicker.noClients")}
          tooltip={t("clientTooltip")}
        />
      ),
    },
    {
      key: "dateRange",
      icon: <CalendarDays className="h-3.5 w-3.5" />,
      label: t("durationLabel"),
      value: (
        <CalendarDatePicker
          value={form.watch("startDate") ?? ""}
          onChange={(date) => form.setValue("startDate", date)}
          endDate={form.watch("endDate") ?? ""}
          onEndDateChange={(date) => form.setValue("endDate", date)}
          locale={locale}
          tooltip={t("dateRangeTooltip")}
        />
      ),
    },
    {
      key: "budget",
      icon: <Hash className="h-3.5 w-3.5" />,
      label: t("budgetLabel"),
      value: (
        <Input
          value={form.watch("budget") ?? ""}
          onChange={(e) => form.setValue("budget", e.target.value)}
          placeholder={t("budgetPlaceholder")}
          className="h-8 w-full max-w-[120px] rounded-lg border-0 bg-transparent px-2 text-sm font-semibold focus-visible:ring-1 focus-visible:ring-ring"
        />
      ),
    },
    {
      key: "visibility",
      icon: <Globe className="h-3.5 w-3.5" />,
      label: t("visibilityLabel"),
      value: (
        <select
          value={form.watch("visibility") ?? "team"}
          onChange={(e) => form.setValue("visibility", e.target.value as any)}
          className="h-8 rounded-lg border-0 bg-transparent px-2 text-sm font-semibold text-foreground focus:ring-1 focus:ring-ring outline-none cursor-pointer"
        >
          <option value="team">{t("visibilityTeam")}</option>
          <option value="workspace">{t("visibilityPublic")}</option>
          <option value="private">{t("visibilityPrivate")}</option>
        </select>
      ),
    },
    {
      key: "tags",
      icon: <Tag className="h-3.5 w-3.5" />,
      label: t("tagsLabel"),
      value: (
        <div className="flex flex-wrap items-center gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted px-2.5 py-0.5 text-[11px] font-bold text-foreground"
            >
              <Tag className="h-2.5 w-2.5 text-muted-foreground" />
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-0.5 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Trash2 className="h-2.5 w-2.5" />
              </button>
            </span>
          ))}
          <input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder={t("tagPlaceholder")}
            className="h-6 w-24 bg-transparent text-[11px] font-semibold text-foreground outline-none placeholder:text-muted-foreground/50"
          />
        </div>
      ),
    },
  ];

  async function handleSubmit() {
    if (account.workspace.status !== "ready" || !account.workspace.organizationId) return;
    const valid = await form.trigger();
    if (!valid) return;
    const data = form.getValues();
    setIsSubmitting(true);
    try {
      const response = await createProjectRequest(account.workspace.organizationId, data);

      await invalidate([
        { type: "list", resource: "projects" },
        { type: "custom", queryKey: ["projects-options"] },
      ]);

      toast({ title: t("createSuccess", { defaultMessage: "Project Created" }), type: "success" });
      onSuccess?.();

      const newProjectId = response?.project?.id || (response as Record<string, unknown>)?.id || ((response as Record<string, unknown>)?.project as Record<string, unknown> | undefined)?._id;
      if (newProjectId) {
        router.push(`/projects/${newProjectId}/overview`);
      } else {
        router.push("/projects");
      }
    } catch (error) {
      logger.error("project.create_failed", { error });
      toast({ title: t("createFailed", { defaultMessage: "Failed to create project" }), type: "error" });
      setIsSubmitting(false);
    }
  }

  return (
    <RecordModal
      isOpen={isOpen}
      onClose={() => onCancel?.()}
      actionLabel={t("createBtn")}
      onAction={handleSubmit}
      isSaving={isSubmitting}
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <WorkOsDocEditor
          title={title}
          body={description}
          fields={fields}
          titlePlaceholder={t("namePlaceholder")}
          bodyPlaceholder={t("bodyPlaceholder")}
          isSaving={isSubmitting}
          onTitleBlur={(v) => {
            if (v !== title) form.setValue("name", v, { shouldValidate: true });
          }}
          onBodyChange={(html) => {
            if (html !== description) form.setValue("description", html, { shouldValidate: true });
          }}
          onBodyBlur={() => {}}
          compactFormatting
        />
      </div>
    </RecordModal>
  );
}
