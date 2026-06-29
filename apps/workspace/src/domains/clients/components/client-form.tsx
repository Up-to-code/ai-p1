"use client";

import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useAccountContext } from "@/domains/auth";
import {
  clientsIndexQueryBaseKey,
  updateClientRequest,
  useCreateClientOptimisticMutation,
} from "@/domains/clients/api/clients";
import type { Client, ClientType, PipelineStage } from "../store/clients.types";
import { clientSchema, type ClientFormValues } from "../validation/client.schema";
import { useOperationState } from "@/lib/utils/operation-state";
import { FormActions, TextInput } from "@/components/shared/crud-ui";

interface ClientFormProps {
  existing?: Client;
  indexQueryKey?: readonly unknown[];
  onSuccess?: (id: string) => void;
  onCancel?: () => void;
}

export function ClientForm({ existing, indexQueryKey, onSuccess, onCancel }: ClientFormProps) {
  const t = useTranslations("Clients");
  const account = useAccountContext();
  const queryClient = useQueryClient();
  const createClientMutation = useCreateClientOptimisticMutation(indexQueryKey);
  
  const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema as any) as Resolver<ClientFormValues>,
    defaultValues: {
      name: existing?.name ?? "",
      type: existing?.type ?? "person" as ClientType,
      contact: existing?.contact ?? "",
      phone: existing?.phone ?? "",
      age: "",
      nationality: "",
      generation: "",
      budget: existing?.budget ?? "",
      assetInterest: existing?.assetInterest ?? "",
      status: existing?.status ?? "new" as Client["status"],
      visibility: existing?.visibility ?? "private",
      pipelineStage: (existing?.pipelineStage ?? "new") as ClientFormValues["pipelineStage"],
      priority: (existing?.priority ?? "normal") as ClientFormValues["priority"],
      nextAction: "",
      issue: "",
    },
  });
  const form = useWatch({ control }) as ClientFormValues;
  const fieldErrors = Object.fromEntries(Object.entries(errors).map(([key, error]) => [key, error?.message])) as Record<keyof ClientFormValues, string | undefined>;
  const saveOperation = useOperationState({ errorMessage: "Client save failed." });

  const setField = (key: keyof ClientFormValues, value: string) => {
    setValue(key, value as never, { shouldDirty: true, shouldValidate: Boolean(fieldErrors[key]) });
    saveOperation.clearError();
  };

  const onSubmit = handleSubmit((data: ClientFormValues) => {
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
      <div className="flex-1 space-y-5">
        <div className="grid gap-5">
          <TextInput
            name="name"
            label={t("form.nameLabel")}
            value={form.name}
            onChange={(value) => setField("name", value)}
            placeholder={t("form.namePlaceholder")}
            autoComplete="name"
            error={fieldErrors.name}
          />
          <div className="grid gap-5 md:grid-cols-2">
            <TextInput
              name="contact"
              label={t("form.emailLabel")}
              type="email"
              value={form.contact}
              onChange={(value) => setField("contact", value)}
              placeholder={t("form.emailPlaceholder")}
              autoComplete="email"
              error={fieldErrors.contact}
            />
            <TextInput
              name="phone"
              label={t("form.phoneLabel")}
              type="tel"
              value={form.phone}
              onChange={(value) => setField("phone", value)}
              placeholder={t("form.phonePlaceholder")}
              autoComplete="tel"
              error={fieldErrors.phone}
            />
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-border pt-6 dark:border-white/5">
        <FormActions 
          isSubmitting={saveOperation.isRunning || createClientMutation.isPending || isSubmitting} 
          onCancel={onCancel || (() => {})} 
          submitLabel={existing ? t('form.saveBtn') : t('form.createBtn')} 
        />
      </div>
    </form>
  );
}
