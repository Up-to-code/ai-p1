"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOptimisticInvalidation } from "@/domains/cache/hooks/use-optimistic-invalidation";
import { logger } from "@/lib/logger";
import { useTranslations, useLocale } from "next-intl";
import {
  projectSchema,
  type ProjectFormInput,
  type ProjectFormValues,
} from "../validation/project.schema";
import { useAuthSession } from "@/domains/auth";
import { createProjectRequest, updateProjectRequest } from "../api/projects";
import { useRouter } from "@/i18n/routing";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { Tag, Trash2, Circle, Activity, Folder, CalendarDays, Globe, Hash } from "lucide-react";
import { CalendarDatePicker } from "@/components/ui/calendar-date-picker";
import { RecordModal } from "@/components/shared/record-modal";
import { WorkOsDocEditor, type DocEditorMetaField } from "@/components/shared/work-os-doc-editor";
import { ProjectStatusPicker, ProjectHealthPicker, ClientInlinePicker } from "./project-pickers";
import { useClientOptionsQuery } from "@/domains/clients/api/clients";
import type { Project } from "../store/projects.types";

export interface ProjectFormProps {
  existing?: Project;
  isOpen: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const fieldCardClassName =
  "rounded-xl border border-border/70 bg-muted/15 px-3 py-2 hover:bg-muted/25";

export function ProjectForm({ existing, isOpen, onSuccess, onCancel }: ProjectFormProps) {
  const session = useAuthSession();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("Projects.form");
  const locale = useLocale();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const { invalidate } = useOptimisticInvalidation();
  const organizationId = session.workspace.status === "ready" ? session.workspace.organizationId ?? undefined : undefined;
  const clientOptionsQuery = useClientOptionsQuery(organizationId);

  const isEdit = Boolean(existing);

  const form = useForm<ProjectFormInput, unknown, ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: existing
      ? {
          name: existing.name ?? "",
          clientId: existing.clientId ?? "",
          opportunityId: existing.opportunityId ?? "",
          status: existing.status ?? "planned",
          health: existing.health ?? "onTrack",
          visibility: existing.visibility ?? "space_members",
          startDate: existing.startDate ?? "",
          endDate: existing.endDate ?? "",
          budget: existing.budget != null ? String(existing.budget) : "",
          description: existing.description ?? "",
          tags: existing.tags ?? [],
          templateId: existing.templateId ?? "",
          useAiSetup: false,
        }
      : {
          name: "",
          clientId: "",
          opportunityId: "",
          status: "planned",
          health: "onTrack",
          visibility: "space_members",
          startDate: "",
          endDate: "",
          budget: "",
          description: "",
          tags: [],
          templateId: "",
          useAiSetup: false,
        },
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
      className: fieldCardClassName,
      icon: <Circle className="h-3.5 w-3.5" />,
      label: t("statusLabel"),
      value: (
        <ProjectStatusPicker
          value={form.watch("status") as "planned"}
          onChange={(value) => form.setValue("status", value as ProjectFormInput["status"])}
          labels={{
            planned: t("statusPlanned"),
            active: t("statusActive"),
            paused: t("statusPaused"),
            completed: t("statusCompleted"),
            archived: t("statusArchived"),
          }}
          tooltip={t("statusTooltip")}
          className="w-full justify-between"
        />
      ),
    },
    {
      key: "health",
      className: fieldCardClassName,
      icon: <Activity className="h-3.5 w-3.5" />,
      label: t("healthLabel"),
      value: (
        <ProjectHealthPicker
          value={form.watch("health") as "onTrack"}
          onChange={(value) => form.setValue("health", value as ProjectFormInput["health"])}
          labels={{
            onTrack: t("healthOnTrack"),
            atRisk: t("healthAtRisk"),
            blocked: t("healthBlocked"),
          }}
          tooltip={t("healthTooltip")}
          className="w-full justify-between"
        />
      ),
    },
    {
      key: "client",
      className: `${fieldCardClassName} md:col-span-2`,
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
          className="w-full justify-between"
        />
      ),
    },
    {
      key: "dateRange",
      className: `${fieldCardClassName} md:col-span-2`,
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
      className: fieldCardClassName,
      icon: <Hash className="h-3.5 w-3.5" />,
      label: t("budgetLabel"),
      value: (
        <Input
          value={form.watch("budget") ?? ""}
          onChange={(e) => form.setValue("budget", e.target.value)}
          placeholder={t("budgetPlaceholder")}
          inputMode="decimal"
          className="h-9 w-full rounded-lg bg-background px-3 text-sm font-semibold"
        />
      ),
    },
    {
      key: "visibility",
      className: fieldCardClassName,
      icon: <Globe className="h-3.5 w-3.5" />,
      label: t("visibilityLabel"),
      value: (
        <Select
          value={form.watch("visibility") ?? "space_members"}
          onValueChange={(value: string | null) => value && form.setValue("visibility", value as ProjectFormInput["visibility"])}
        >
          <SelectTrigger aria-label={t("visibilityLabel")} className="h-9 w-full justify-between rounded-lg bg-background text-sm font-semibold">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="space_members">{t("visibilityTeam")}</SelectItem>
            <SelectItem value="organization">{t("visibilityPublic")}</SelectItem>
            <SelectItem value="private">{t("visibilityPrivate")}</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      key: "tags",
      className: `${fieldCardClassName} md:col-span-2`,
      icon: <Tag className="h-3.5 w-3.5" />,
      label: t("tagsLabel"),
      value: (
        <div className="flex min-h-9 flex-wrap items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5">
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
                aria-label={`${t("uploadRemove")} ${tag}`}
                className="ms-0.5 text-muted-foreground transition-colors hover:text-foreground"
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
            className="h-6 min-w-28 flex-1 bg-transparent text-xs font-medium text-foreground outline-none placeholder:text-muted-foreground/60"
          />
        </div>
      ),
    },
  ];

  async function handleSubmit() {
    if (session.workspace.status !== "ready" || !session.workspace.organizationId) return;
    const valid = await form.trigger();
    if (!valid) return;
    const rawData = form.getValues();
    const data = projectSchema.parse(rawData);
    setIsSubmitting(true);
    try {
      if (isEdit && existing) {
        await updateProjectRequest(session.workspace.organizationId, existing.id, data);
        await invalidate([
          { type: "detail", resource: "projects", id: existing.id },
          { type: "list", resource: "projects" },
          { type: "custom", queryKey: ["projects-options"] },
        ]);
        toast({ title: t("editSuccess", { defaultMessage: "Project Updated" }), type: "success" });
        onSuccess?.();
        router.push(`/projects/${existing.id}`);
      } else {
        const response = await createProjectRequest(session.workspace.organizationId, data);
        await invalidate([
          { type: "list", resource: "projects" },
          { type: "custom", queryKey: ["projects-options"] },
        ]);
        toast({ title: t("createSuccess", { defaultMessage: "Project Created" }), type: "success" });
        onSuccess?.();
        const newProjectId = response?.project?.id || (response as Record<string, unknown>)?.id || ((response as Record<string, unknown>)?.project as Record<string, unknown> | undefined)?._id;
        if (newProjectId) {
          router.push(`/projects/${newProjectId}`);
        } else {
          router.push("/projects");
        }
      }
    } catch (error) {
      logger.error(isEdit ? "project.update_failed" : "project.create_failed", { error });
      toast({ title: t(isEdit ? "editFailed" : "createFailed", { defaultMessage: isEdit ? "Failed to update project" : "Failed to create project" }), type: "error" });
      setIsSubmitting(false);
    }
  }

  return (
    <RecordModal
      isOpen={isOpen}
      onClose={() => onCancel?.()}
      title={isEdit ? undefined : t("createTitle")}
      description={isEdit ? undefined : t("createSubtitle")}
      actionLabel={isEdit ? t("saveChangesBtn") : t("createBtn")}
      onAction={handleSubmit}
      isSaving={isSubmitting}
      defaultWidth={isEdit ? undefined : 780}
      defaultHeight={isEdit ? undefined : 680}
      minWidth={isEdit ? undefined : 560}
      maxWidth={isEdit ? undefined : 920}
      minHeight={isEdit ? undefined : 520}
      maxHeight={isEdit ? undefined : 820}
      className="border border-border bg-background shadow-2xl"
    >
      <div className="min-h-0 flex-1 overflow-y-auto">
        <WorkOsDocEditor
          title={title}
          body={description}
          fields={fields}
          titlePlaceholder={t("namePlaceholder")}
          bodyPlaceholder={t("bodyPlaceholder")}
          bodyLabel={isEdit ? undefined : t("descLabel")}
          isSaving={isSubmitting}
          onTitleBlur={(v) => {
            if (v !== title) form.setValue("name", v, { shouldValidate: true });
          }}
          onBodyChange={(html) => {
            if (html !== description) form.setValue("description", html, { shouldValidate: true });
          }}
          onBodyBlur={() => {}}
          compactFormatting
          contentClassName="max-w-none px-6 pb-8 pt-6 sm:px-8"
          titleClassName="text-2xl font-semibold tracking-tight sm:text-[1.75rem]"
          editorMinHeightClassName="min-h-[180px]"
          fieldLayout="cards"
          editorEngine="tiptap"
        />
      </div>
    </RecordModal>
  );
}
