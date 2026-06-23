"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { projectSchema, type ProjectFormValues } from "../validation/project.schema";
import { useAccountContext } from "@/domains/auth";
import { updateProjectRequest } from "../api/projects";
import { useRouter } from "@/i18n/routing";  
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { Loader2, User, ChevronDown, Trash2 } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { ClientPickerModal } from "./client-picker-modal";
import { cn } from "@/lib/utils";
import { Tag } from "lucide-react";
import type { Project } from "../store/projects.types";

interface EditProjectFormProps {
  project: Project;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function EditProjectForm({ project, onSuccess, onCancel }: EditProjectFormProps) {
  const account = useAccountContext();
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations("Projects.form");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClientPickerOpen, setIsClientPickerOpen] = useState(false);
  const [selectedClientName, setSelectedClientName] = useState("");
  const [tagInput, setTagInput] = useState("");

  const queryClient = useQueryClient();

  const form = useForm<ProjectFormValues>({
    resolver: (zodResolver as any)(projectSchema),
    defaultValues: {
      name: project.name ?? "",
      clientId: project.clientId ?? "",
      opportunityId: project.opportunityId ?? "",
      status: project.status ?? "planned",
      health: project.health ?? "onTrack",
      visibility: project.visibility ?? "team",
      startDate: project.startDate ?? "",
      endDate: project.endDate ?? "",
      budget: project.budget != null ? String(project.budget) : "",
      description: project.description ?? "",
      tags: project.tags ?? [],
      templateId: project.templateId ?? "",
      useAiSetup: false,
    },
  });

  const tags = form.watch("tags") ?? [];

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

  async function onSubmit(data: ProjectFormValues) {
    if (account.workspace.status !== "ready" || !account.workspace.organizationId) return;
    setIsSubmitting(true);
    try {
      await updateProjectRequest(account.workspace.organizationId, project.id, data);

      queryClient.invalidateQueries({ queryKey: ["projects-options"] });
      queryClient.invalidateQueries({ queryKey: ["projects-index"] });
      queryClient.invalidateQueries({ queryKey: ["projects-paged"] });
      queryClient.invalidateQueries({ queryKey: ["project", account.workspace.organizationId, project.id] });

      toast({ title: t("editSuccess", { defaultMessage: "Project Updated" }), type: "success" });
      onSuccess?.();
      router.push("/projects");
    } catch (error) {
      console.error("Update project error:", error);
      toast({ title: t("editFailed", { defaultMessage: "Failed to update project" }), type: "error" });
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">

        <div className="mb-8 border-b border-border pb-6 dark:border-white/5">
          <h1 className="text-3xl font-black tracking-tight text-text-primary">{t("editTitle")}</h1>
          <p className="mt-2 text-sm font-medium text-text-secondary">{t("editSubtitle")}</p>
        </div>

        <div className="space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="text-start">
                <FormLabel className="text-xs font-bold uppercase tracking-wider text-text-secondary">{t("nameLabel")}</FormLabel>
                <FormControl>
                  <Input placeholder={t("namePlaceholder")} className="h-12 rounded-xl bg-background/50 px-4 text-base font-medium focus-visible:ring-1 focus-visible:ring-primary dark:bg-white/5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-8 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem className="text-start">
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-text-secondary">{t("clientPicker.title")}</FormLabel>
                  <button
                    type="button"
                    onClick={() => setIsClientPickerOpen(true)}
                    className={cn(
                      "flex h-12 w-full items-center gap-3 rounded-xl border border-border bg-background/50 px-4 text-start transition-colors hover:border-border hover:bg-muted/50 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    <User className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <span className={cn("flex-1 truncate text-sm font-medium", field.value ? "text-text-primary" : "text-muted-foreground")}>
                      {selectedClientName || t("clientPicker.selectPlaceholder", { defaultMessage: "Select a client..." })}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </button>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="budget"
              render={({ field }) => (
              <FormItem className="text-start">
                <FormLabel className="text-xs font-bold uppercase tracking-wider text-text-secondary">{t("budgetLabel", { defaultMessage: "Budget" })}</FormLabel>
                <FormControl>
                  <Input placeholder={t("budgetPlaceholder")} className="h-12 rounded-xl bg-background/50 px-4 text-base font-medium focus-visible:ring-1 focus-visible:ring-primary dark:bg-white/5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
              )}
            />
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem className="flex flex-col text-start">
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">{t("startDateLabel", { defaultMessage: "Start Date" })}</FormLabel>
                  <DatePicker
                    date={field.value ? new Date(field.value) : undefined}
                    setDate={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                    className="h-12 w-full rounded-xl bg-background/50 px-4 text-base font-medium focus-visible:ring-1 focus-visible:ring-primary dark:bg-white/5"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem className="flex flex-col text-start">
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">{t("endDateLabel", { defaultMessage: "End Date" })}</FormLabel>
                  <DatePicker
                    date={field.value ? new Date(field.value) : undefined}
                    setDate={(date) => field.onChange(date ? format(date, "yyyy-MM-dd") : "")}
                    className="h-12 w-full rounded-xl bg-background/50 px-4 text-base font-medium focus-visible:ring-1 focus-visible:ring-primary dark:bg-white/5"
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-8 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="text-start">
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-text-secondary">{t("statusLabel")}</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-12 w-full items-center rounded-xl border border-border bg-background/50 px-4 text-sm font-medium focus-visible:ring-1 focus-visible:ring-primary dark:border-white/10 dark:bg-white/5"
                    >
                      <option value="planned">{t("statusPlanned")}</option>
                      <option value="active">{t("statusActive")}</option>
                      <option value="paused">{t("statusPaused")}</option>
                      <option value="completed">{t("statusCompleted")}</option>
                      <option value="archived">{t("statusArchived")}</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="health"
              render={({ field }) => (
                <FormItem className="text-start">
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-text-secondary">{t("healthLabel", { defaultMessage: "Health" })}</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="flex h-12 w-full items-center rounded-xl border border-border bg-background/50 px-4 text-sm font-medium focus-visible:ring-1 focus-visible:ring-primary dark:border-white/10 dark:bg-white/5"
                    >
                      <option value="onTrack">{t("healthOnTrack")}</option>
                      <option value="atRisk">{t("healthAtRisk")}</option>
                      <option value="blocked">{t("healthBlocked")}</option>
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Tags */}
          <div className="text-start">
            <FormLabel className="text-xs font-bold uppercase tracking-wider text-text-secondary">{t("tagsLabel")}</FormLabel>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-bold text-foreground dark:border-white/10 dark:bg-white/5"
                >
                  <Tag className="h-3 w-3 text-muted-foreground" />
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-0.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-2">
                  <Input
                    placeholder={t("tagPlaceholder")}
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="h-8 w-36 rounded-full border-border bg-background/50 px-3 text-xs dark:border-white/10 dark:bg-white/5"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={addTag}
                    className="h-8 rounded-full px-3 text-xs font-bold"
                  >
                    {t("addTagBtn")}
                  </Button>
              </div>
            </div>
            <p className="mt-1.5 text-[11px] text-muted-foreground">{t("tagsHelper")}</p>
          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="text-start">
                <FormLabel className="text-xs font-bold uppercase tracking-wider text-text-secondary">{t("descLabel")}</FormLabel>
                <FormControl>
                  <TiptapEditor
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    className="min-h-[120px] bg-background/50 dark:bg-white/5"
                    disableImageUpload
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="mt-10 flex flex-col-reverse items-center gap-4 border-t border-border pt-6 sm:flex-row sm:justify-end dark:border-white/5">
          <Button type="button" variant="ghost" className="w-full sm:w-auto h-12 rounded-xl px-8 font-bold text-text-secondary hover:bg-muted hover:text-text-primary dark:hover:bg-white/10" onClick={() => { onCancel?.(); router.back(); }} disabled={isSubmitting}>
            {t("cancelBtn")}
          </Button>
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto h-12 min-w-[160px] rounded-xl px-8 font-bold transition-all">
            {isSubmitting ? <Loader2 className="me-2 h-5 w-5 animate-spin" /> : t("saveChangesBtn")}
          </Button>
        </div>
      </form>

      <ClientPickerModal
        open={isClientPickerOpen}
        onOpenChange={setIsClientPickerOpen}
        selectedClientId={form.watch("clientId")}
        selectedClientName={selectedClientName}
        onSelect={(clientId, clientName) => {
          form.setValue("clientId", clientId);
          setSelectedClientName(clientName);
        }}
      />
    </Form>
  );
}
