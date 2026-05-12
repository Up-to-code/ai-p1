"use client";

import { useActionState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { GeneratedAvatarView } from "@/components/portal/GeneratedAvatar";
import {
  updatePartnerProfileAction,
  updateProgrammerOrganizationAction,
  type AccountActionState,
} from "@/app/(portal)/dashboard/actions";
import { useAccount } from "@/hooks/use-account";
import { useOrganization } from "@/hooks/use-organization";
import { formatDateLabel } from "@/utilities/format";
import type { PartnerAccountView } from "@/types/account";

const initialState: AccountActionState = { ok: false };

export function AccountForms({ account }: { account: PartnerAccountView }) {
  const { displayName, displayEmail, avatar } = useAccount(account);
  const { organization } = useOrganization(account);
  const [profileState, profileAction, profilePending] = useActionState(updatePartnerProfileAction, initialState);
  const [orgState, orgAction, orgPending] = useActionState(updateProgrammerOrganizationAction, initialState);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <GeneratedAvatarView avatar={avatar} className="h-16 w-16 text-lg" />
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold text-foreground">{displayName}</h2>
            <p className="truncate text-sm text-muted-foreground">{displayEmail ?? "No email available"}</p>
            <p className="mt-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Developer account
            </p>
          </div>
        </div>

        <form action={profileAction} className="mt-6 space-y-4">
          <Field label="Display name">
            <Input name="name" defaultValue={displayName} minLength={2} maxLength={80} required />
          </Field>
          {profileState.message ? (
            <Alert variant={profileState.ok ? "success" : "danger"}>{profileState.message}</Alert>
          ) : null}
          <Button type="submit" disabled={profilePending}>
            {profilePending ? "Saving..." : "Save profile"}
          </Button>
        </form>
      </section>

      <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Programmer organization</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            This organization owns your app registrations, review state, and workspace links.
          </p>
        </div>

        {organization ? (
          <>
            <div className="mt-5 grid gap-3 rounded-lg border border-border bg-muted/30 p-4 text-sm sm:grid-cols-2">
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Type</div>
                <div className="mt-1 font-medium text-foreground">Programmer</div>
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Created</div>
                <div className="mt-1 font-medium text-foreground">{formatDateLabel(organization.createdAt)}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Tenant organization</div>
                <div className="mt-1 break-all font-mono text-xs text-foreground">
                  {organization.tenantOrganizationId ?? "Pending tenant link"}
                </div>
              </div>
            </div>

            <form action={orgAction} className="mt-6 grid gap-4 sm:grid-cols-[minmax(0,1fr)_120px]">
              <Field label="Organization name">
                <Input name="name" defaultValue={organization.name} minLength={2} maxLength={120} required />
              </Field>
              <Field label="Country">
                <Input name="countryCode" defaultValue={organization.countryCode} minLength={2} maxLength={2} required />
              </Field>
              <div className="sm:col-span-2">
                {orgState.message ? (
                  <Alert variant={orgState.ok ? "success" : "danger"} className="mb-4">{orgState.message}</Alert>
                ) : null}
                <Button type="submit" disabled={orgPending}>
                  {orgPending ? "Saving..." : "Save organization"}
                </Button>
              </div>
            </form>
          </>
        ) : (
          <Alert variant="danger" className="mt-5">
            Programmer organization is not ready yet. Sign out and sign back in, or create the organization from signup.
          </Alert>
        )}
      </section>
    </div>
  );
}
