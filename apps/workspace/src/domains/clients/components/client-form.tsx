"use client";

import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient, useQuery as useReactQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useAccountContext } from "@/domains/auth";
import { getOrganizationCapabilities } from "@/domains/organization/api/clerk-organization-api";
import {
  clientsIndexQueryBaseKey,
  updateClientRequest,
  useCreateClientOptimisticMutation,
} from "@/domains/clients/api/clients";
import type { Client, ClientType, PipelineStage } from "../store/clients.types";
import { clientSchema, type ClientFormValues } from "../validation/client.schema";
import { useOperationState } from "@/lib/utils/operation-state";
import { SelectField, SegmentedControl, FormActions, FormErrorSummary, TextInput } from "@/components/shared/crud-ui";

interface ClientFormProps {
  existing?: Client;
  indexQueryKey?: readonly unknown[];
  onSuccess?: (id: string) => void;
  onCancel?: () => void;
}

const pipelineStages = ["new", "qualified", "review", "negotiation", "closed"] as const;

export function ClientForm({ existing, indexQueryKey, onSuccess, onCancel }: ClientFormProps) {
  const t = useTranslations('Clients');
  const account = useAccountContext();
  const queryClient = useQueryClient();
  const createClientMutation = useCreateClientOptimisticMutation(indexQueryKey);
  const capabilitiesQuery = useReactQuery({
    queryKey: ["organization-capabilities", account.organization.id],
    queryFn: () => getOrganizationCapabilities(account.organization.id!),
    enabled: Boolean(account.organization.id),
  });
  const canManageVisibility = capabilitiesQuery.data?.canManageVisibility ?? false;
  
  const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema as any) as Resolver<ClientFormValues>,
    defaultValues: {
      name: existing?.name ?? "",
      type: existing?.type ?? "person" as ClientType,
      contact: existing?.contact ?? "",
      phone: existing?.phone ?? "",
      age: String(existing?.age ?? 30),
      nationality: existing?.nationality ?? "Saudi",
      generation: existing?.generation ?? "Millennial",
      budget: existing?.budget ?? "",
      assetInterest: existing?.assetInterest ?? "",
      status: existing?.status ?? "new" as Client["status"],
      visibility: existing?.visibility ?? "private",
      pipelineStage: existing?.pipelineStage ?? "new" as PipelineStage,
      priority: existing?.priority ?? "normal" as Client["priority"],
      nextAction: existing?.nextAction ?? "",
      issue: existing?.issue ?? "",
    },
  });
  const form = useWatch({ control }) as ClientFormValues;
  const fieldErrors = Object.fromEntries(Object.entries(errors).map(([key, error]) => [key, error?.message])) as Record<keyof ClientFormValues, string | undefined>;
  const saveOperation = useOperationState({ errorMessage: "Client save failed." });

  const setField = (key: keyof ClientFormValues, value: string) => {
    setValue(key, value as never, { shouldDirty: true, shouldValidate: Boolean(fieldErrors[key]) });
    saveOperation.clearError();
  };

  const onSubmit = handleSubmit((data) => {
    if (!account.organization.id) return;

    if (existing) {
      void saveOperation.run(async () => {
        const result = await updateClientRequest(account.organization.id!, existing.id, data);
        await queryClient.invalidateQueries({ queryKey: clientsIndexQueryBaseKey(account.organization.id ?? undefined) });
        return result.client.id;
      }, {
        successMessage: "Client saved.",
        onSuccess: (nextId) => onSuccess?.(nextId),
      });
      return;
    }

    createClientMutation.mutate(
      { organizationId: account.organization.id, values: data },
      { onSuccess: (result) => onSuccess?.(result.client.id) },
    );
  });

  return (
    <form className="flex h-full flex-col" onSubmit={onSubmit}>
      <div className="flex-1 space-y-12">
        <FormErrorSummary errors={fieldErrors} />
        
        <div className="grid gap-8">
          <TextInput name="name" label={t('form.nameLabel')} value={form.name} onChange={(value) => setField("name", value)} placeholder={t("form.namePlaceholder")} autoComplete="name" error={fieldErrors.name} />
          
          <div className="grid gap-6 md:grid-cols-2">
            <TextInput name="contact" label={t('form.emailLabel')} type="email" value={form.contact} onChange={(value) => setField("contact", value)} placeholder={t("form.emailPlaceholder")} error={fieldErrors.contact} />
            <TextInput name="phone" label={t('form.phoneLabel')} type="tel" value={form.phone} onChange={(value) => setField("phone", value)} placeholder={t("form.phonePlaceholder")} error={fieldErrors.phone} />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <TextInput name="age" label={t('form.ageLabel')} type="number" value={form.age} onChange={(value) => setField("age", value)} error={fieldErrors.age} />
            <TextInput name="budget" label={t('form.budgetLabel')} value={form.budget} onChange={(value) => setField("budget", value)} placeholder={t("form.budgetPlaceholder")} error={fieldErrors.budget} />
          </div>
          
          <TextInput name="assetInterest" label={t('form.interestLabel')} value={form.assetInterest} onChange={(value) => setField("assetInterest", value)} placeholder={t("form.interestPlaceholder")} error={fieldErrors.assetInterest} />
          <TextInput name="nextAction" label={t('form.actionLabel')} value={form.nextAction} onChange={(value) => setField("nextAction", value)} placeholder={t("form.actionPlaceholder")} error={fieldErrors.nextAction} />
        </div>

        <div className="grid gap-8">
          <div className="grid gap-6 md:grid-cols-2">
            <SegmentedControl
              id="type"
              label={t('form.typeLabel')}
              value={form.type}
              onChange={(value) => setField("type", value)}
              options={[
                { value: "person", label: t('types.person') },
                { value: "organization", label: t('types.organization') },
              ]}
              error={fieldErrors.type}
            />

            <SegmentedControl 
              id="priority" 
              label={t('form.priorityLabel')} 
              value={form.priority} 
              onChange={(value) => setField("priority", value)} 
              options={[
                { value: "normal", label: t('priorities.normal') }, 
                { value: "high", label: t('priorities.high') }, 
                { value: "urgent", label: t('priorities.urgent') }
              ]} 
              error={fieldErrors.priority} 
            />
          </div>

          <SelectField 
            id="pipelineStage" 
            label={t('form.stageLabel')} 
            value={form.pipelineStage} 
            onChange={(value) => setField("pipelineStage", value)} 
            options={pipelineStages.map((stage) => ({ value: stage, label: t(`stages.${stage}`) }))} 
            error={fieldErrors.pipelineStage} 
          />
          {canManageVisibility && (
            <SelectField
              id="visibility"
              label={t("form.visibilityLabel")}
              value={form.visibility ?? "private"}
              onChange={(value) => setField("visibility", value)}
              options={[
                { value: "private", label: t("form.visibilityPrivate") },
                { value: "team", label: t("form.visibilityTeam") },
                { value: "workspace", label: t("form.visibilityWorkspace") },
              ]}
              error={fieldErrors.visibility}
            />
          )}
        </div>
      </div>

      <div className="mt-12 border-t border-zinc-100 pt-8 dark:border-white/5">
        <FormActions 
          isSubmitting={saveOperation.isRunning || createClientMutation.isPending || isSubmitting} 
          onCancel={onCancel || (() => {})} 
          submitLabel={existing ? t('form.saveBtn') : t('form.createBtn')} 
        />
      </div>
    </form>
  );
}
