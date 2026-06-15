"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { projectSchema, type ProjectFormValues } from "../validation/project.schema";
import { useAccountContext } from "@/domains/auth";
import { createProjectRequest } from "../api/projects";
import { useRouter } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/components/ui/toast";
import { TiptapEditor } from "@/components/ui/tiptap-editor";
import { uploadFiles } from "@/lib/uploadthing";
import { Loader2, User, ChevronDown } from "lucide-react";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";
import { ClientPickerModal } from "./client-picker-modal";
import { cn } from "@/lib/utils";

export interface CreateProjectFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateProjectForm({ onSuccess, onCancel }: CreateProjectFormProps) {
  const account = useAccountContext();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isClientPickerOpen, setIsClientPickerOpen] = useState(false);
  const [selectedClientName, setSelectedClientName] = useState("");

  const queryClient = useQueryClient();

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
      templateId: "",
      useAiSetup: false,
    } as ProjectFormValues,
  });

  async function onSubmit(data: ProjectFormValues) {
    if (account.workspace.status !== "ready" || !account.workspace.organizationId) return;
    setIsSubmitting(true);
    try {
      const response = await createProjectRequest(account.workspace.organizationId, data);
      
      // Invalidate project queries so it shows up in dropdown and lists
      queryClient.invalidateQueries({ queryKey: ["projects-options"] });
      queryClient.invalidateQueries({ queryKey: ["projects-index"] });
      queryClient.invalidateQueries({ queryKey: ["projects-paged"] });
      
      toast({ title: "Project Created", type: "success" });
      onSuccess?.();
      
      // Fallback in case response shape differs
      const newProjectId = response?.project?.id || (response as Record<string, unknown>)?.id || ((response as Record<string, unknown>)?.project as Record<string, unknown> | undefined)?._id;
      if (newProjectId) {
        router.push(`/projects/${newProjectId}/overview`);
      } else {
        router.push(`/projects`);
      }
    } catch (error) {
      console.error("Create project error:", error);
      toast({ title: "Failed to create project", type: "error" });
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="relative overflow-hidden rounded-[2rem] border border-border bg-surface p-8 dark:border-white/5 dark:bg-[#0a0a0a]">
        
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute -inset-px opacity-50 transition duration-300 group-hover:opacity-100" style={{ background: "radial-gradient(600px circle at 50% -20%, rgba(99,102,241,0.1), transparent 40%)" }} />

        <div className="relative z-10 mb-10 text-start">
          <h2 className="text-3xl font-black tracking-tight text-text-primary">New Project</h2>
          <p className="mt-2 text-sm font-medium text-text-secondary">Set up a new delivery container for your client.</p>
        </div>

        <div className="relative z-10 space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="text-start">
                <FormLabel className="text-xs font-bold uppercase tracking-wider text-text-secondary">Project Name</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Acme Corp Rebrand" className="h-12 rounded-xl bg-background/50 px-4 text-base font-medium focus-visible:ring-1 focus-visible:ring-primary dark:bg-white/5" {...field} />
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
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-text-secondary">Client</FormLabel>
                  <button
                    type="button"
                    onClick={() => setIsClientPickerOpen(true)}
                    className={cn(
                      "flex h-12 w-full items-center gap-3 rounded-xl border border-zinc-200 bg-background/50 px-4 text-start transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 dark:hover:bg-white/10",
                      !field.value && "text-zinc-400"
                    )}
                  >
                    <User className="h-4 w-4 shrink-0 text-zinc-400" />
                    <span className={cn("flex-1 truncate text-sm font-medium", field.value ? "text-text-primary" : "text-zinc-400")}>
                      {selectedClientName || "Select a client..."}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-zinc-400" />
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
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-text-secondary">Budget</FormLabel>
                  <FormControl>
                    <Input placeholder="$0.00" className="h-12 rounded-xl bg-background/50 px-4 text-base font-medium focus-visible:ring-1 focus-visible:ring-primary dark:bg-white/5" {...field} />
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
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">Start Date</FormLabel>
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
                  <FormLabel className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-1">End Date</FormLabel>
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

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem className="text-start">
                <FormLabel className="text-xs font-bold uppercase tracking-wider text-text-secondary">Description</FormLabel>
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

        <div className="relative z-10 mt-10 flex flex-col-reverse items-center gap-4 pt-6 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" className="w-full sm:w-auto h-12 rounded-xl px-8 font-bold text-text-secondary hover:bg-zinc-100 hover:text-text-primary dark:hover:bg-white/10" onClick={() => { onCancel?.(); router.back(); }} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto h-12 min-w-[160px] rounded-xl px-8 font-bold transition-all">
            {isSubmitting ? <Loader2 className="me-2 h-5 w-5 animate-spin" /> : "Create Project"}
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
