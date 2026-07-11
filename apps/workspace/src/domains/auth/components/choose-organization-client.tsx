"use client";

import {
  AlertCircle,
  Loader2,
  MailCheck,
  Plus,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { BrandMark } from "@/components/logo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Link } from "@/i18n/routing";
import { AuthAccountButton } from "./auth-account-button";
import { useOrganizationEntry } from "../hooks/use-organization-entry";

type ChooseOrganizationClientProps = {
  callbackURL?: string | null;
  locale: string;
};

function WorkspaceListSkeleton({ label }: { label: string }) {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((item) => (
        <div
          className="min-h-20 rounded-lg border border-border bg-card p-4"
          key={item}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3 w-2/3 animate-pulse rounded-full bg-muted" />
              <div className="h-2.5 w-1/2 animate-pulse rounded-full bg-muted" />
            </div>
          </div>
        </div>
      ))}
      <p className="text-xs font-semibold text-muted-foreground">{label}</p>
    </div>
  );
}

export function ChooseOrganizationClient({
  callbackURL,
  locale,
}: ChooseOrganizationClientProps) {
  const t = useTranslations("ChooseOrg");
  const {
    session,
    organizations: orgs,
    createOpen,
    setCreateOpen,
    organizationName,
    setOrganizationName,
    busyId,
    busyAction,
    error,
    isInitialLoading,
    visibleInvitations,
    organizationSlug,
    selectOrganization,
    acceptInvitation,
    createOrganization,
    useAnotherAccount,
  } = useOrganizationEntry({ callbackURL, locale });

  return (
    <main className="relative flex min-h-svh flex-col bg-[var(--q-bg)] text-foreground">
      <div className="flex flex-1 animate-in items-center justify-center fade-in zoom-in-95 duration-300">
        <header className="absolute inset-x-0 top-0 z-10 flex h-14 items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2">
            <BrandMark className="h-5 w-5" priority />
            <span className="text-xs font-semibold tracking-tight">
              qentrah
            </span>
          </Link>
          <AuthAccountButton
            disabled={busyAction === "sign-out"}
            label={t("useAnotherAccount")}
            loading={busyAction === "sign-out"}
            loadingLabel={t("signingOut")}
            onClick={() => void useAnotherAccount()}
            user={session?.user}
          />
        </header>

        {error ? (
          <div className="absolute inset-x-6 top-16 mx-auto flex max-w-md items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}

        {isInitialLoading ? (
          <div className="w-full max-w-md px-6">
            <WorkspaceListSkeleton label={t("loading")} />
          </div>
        ) : (
          <div className="flex w-full max-w-md flex-col gap-3 px-6">
            {visibleInvitations.map((invitation) => {
              const invitationBusy = busyId === `invitation:${invitation.id}`;
              return (
                <button
                  className="group flex min-h-24 items-center gap-4 rounded-2xl border border-border bg-card p-4 text-start transition duration-200 hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60"
                  disabled={Boolean(busyId || busyAction)}
                  key={invitation.id}
                  onClick={() => void acceptInvitation(invitation)}
                  type="button"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
                    {invitationBusy ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : (
                      <MailCheck className="size-5" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {invitation.organizationName || invitation.organizationId}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {invitationBusy
                        ? t("acceptingInvite")
                        : t("acceptInvite")}
                    </span>
                  </span>
                </button>
              );
            })}
            {orgs?.map((org) => {
              const isBusy = busyId === org.id;
              return (
                <button
                  className="group flex min-h-24 items-center gap-4 rounded-2xl border border-border bg-card p-4 text-start transition duration-200 hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60"
                  disabled={Boolean(busyId || busyAction)}
                  key={org.id}
                  onClick={() => void selectOrganization(org.id)}
                  type="button"
                >
                  <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-muted text-muted-foreground">
                    {isBusy ? (
                      <Loader2 className="size-5 animate-spin" />
                    ) : org.logo ? (
                      <img
                        alt=""
                        className="size-full object-cover"
                        src={org.logo}
                      />
                    ) : (
                      <BrandMark className="size-7" />
                    )}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold text-foreground">
                      {org.name ?? t("untitledWorkspace")}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {isBusy ? t("loading") : (org.slug ?? "")}
                    </span>
                  </span>
                </button>
              );
            })}
            <button
              className="group flex min-h-24 items-center gap-4 rounded-2xl border border-dashed border-border bg-card/40 p-4 text-start transition duration-200 hover:-translate-y-0.5 hover:border-foreground/30 hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60"
              disabled={Boolean(busyId || busyAction)}
              onClick={() => setCreateOpen(true)}
              type="button"
            >
              <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl border border-border bg-background text-muted-foreground transition duration-200 group-hover:scale-110 group-hover:text-foreground">
                <Plus className="size-5" />
              </span>
              <span className="text-sm font-medium text-foreground">
                {t("createNew")}
              </span>
            </button>
          </div>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md rounded-md p-5 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {t("createModalTitle")}
            </DialogTitle>
            <DialogDescription>{t("createModalDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <label htmlFor="organization-name" className="text-sm font-black">
              {t("createNameLabel")}
            </label>
            <Input
              className="h-10 rounded-md"
              id="organization-name"
              onChange={(event) => {
                setOrganizationName(event.target.value);
              }}
              placeholder={t("createNamePlaceholder")}
              value={organizationName}
            />
            <p className="text-xs font-semibold text-muted-foreground">
              {organizationSlug || "workspace-slug"}
            </p>
          </div>
          <DialogFooter className="mt-2 rounded-b-lg">
            <Button
              className="h-9 rounded-md"
              disabled={busyAction === "create"}
              onClick={() => setCreateOpen(false)}
              type="button"
              variant="outline"
            >
              {t("hideCreate")}
            </Button>
            <Button
              className="h-9 rounded-md"
              disabled={busyAction === "create" || Boolean(busyId)}
              onClick={() => void createOrganization()}
              type="button"
            >
              {busyAction === "create" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {busyAction === "create" ? t("creating") : t("createBtn")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
