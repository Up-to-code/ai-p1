"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, PlugZap, Trash2 } from "lucide-react";
import type { Id } from "@convex/_generated/dataModel";
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
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/toast";
import {
  type AutomationConnectionProvider,
  useAutomationBindings,
} from "../hooks/use-automation-bindings";

type Props = {
  organizationId?: string;
  provider: AutomationConnectionProvider;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: (connectionId: string) => void;
};

const providerCopy = {
  google_sheets: {
    title: "Connect Google Sheets",
    description:
      "Store a Google OAuth access or refresh token for read-only spreadsheet automation. Credentials are encrypted and never copied into workflow steps.",
  },
  whatsapp: {
    title: "Connect WhatsApp Business",
    description:
      "Store a Meta Cloud API token and phone number ID for outbound text messages. Credentials are encrypted and owner-scoped.",
  },
};

export function AutomationConnectionDialog({
  organizationId,
  provider,
  open,
  onOpenChange,
  onSaved,
}: Props) {
  const toast = useToast();
  const bindings = useAutomationBindings(organizationId);
  const [label, setLabel] = useState(
    provider === "google_sheets" ? "Google Sheets" : "WhatsApp Business",
  );
  const [accountLabel, setAccountLabel] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLabel(provider === "google_sheets" ? "Google Sheets" : "WhatsApp Business");
    setAccountLabel("");
    setAccessToken("");
    setRefreshToken("");
    setClientId("");
    setClientSecret("");
    setPhoneNumberId("");
  }, [provider]);

  const providerConnections =
    bindings.connections?.filter((connection) => connection.provider === provider) ?? [];

  async function save() {
    if (!organizationId) return;
    setSaving(true);
    try {
      const connectionId =
        provider === "google_sheets"
          ? await bindings.saveConnection({
              organizationId,
              label,
              accountLabel: accountLabel || undefined,
              secret: {
                provider,
                credentials: {
                  accessToken: accessToken || undefined,
                  refreshToken: refreshToken || undefined,
                  clientId: clientId || undefined,
                  clientSecret: clientSecret || undefined,
                },
              },
            })
          : await bindings.saveConnection({
              organizationId,
              label,
              accountLabel: accountLabel || undefined,
              secret: {
                provider,
                credentials: { accessToken, phoneNumberId },
              },
            });
      onSaved(connectionId);
      onOpenChange(false);
      toast.toast({ title: "Connection saved", type: "success" });
    } catch (error) {
      toast.toast({
        title: "Connection could not be saved",
        description: error instanceof Error ? error.message : undefined,
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{providerCopy[provider].title}</DialogTitle>
          <DialogDescription>{providerCopy[provider].description}</DialogDescription>
        </DialogHeader>

        {providerConnections.length > 0 && (
          <section className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs font-semibold">Connected accounts</p>
            <div className="mt-2 space-y-2">
              {providerConnections.map((connection) => (
                <div
                  key={connection.id}
                  className="flex items-center gap-2 rounded-md bg-background p-2"
                >
                  <PlugZap className="size-4 text-primary" />
                  <button
                    type="button"
                    className="min-w-0 flex-1 text-left"
                    onClick={() => {
                      onSaved(connection.id);
                      onOpenChange(false);
                    }}
                  >
                    <p className="truncate text-xs font-semibold">{connection.label}</p>
                    {connection.accountLabel && (
                      <p className="truncate text-[11px] text-muted-foreground">
                        {connection.accountLabel}
                      </p>
                    )}
                  </button>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    aria-label={`Disconnect ${connection.label}`}
                    onClick={() =>
                      void bindings.revokeConnection({
                        connectionId: connection.id as Id<"automationConnections">,
                      })
                    }
                  >
                    <Trash2 className="size-3.5 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid gap-4 py-2 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="connection-label">Connection name</Label>
            <Input
              id="connection-label"
              value={label}
              onChange={(event) => setLabel(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="account-label">Account label</Label>
            <Input
              id="account-label"
              value={accountLabel}
              onChange={(event) => setAccountLabel(event.target.value)}
              placeholder="Operations account"
            />
          </div>
          {provider === "google_sheets" ? (
            <>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="google-refresh-token">OAuth refresh token</Label>
                <Input
                  id="google-refresh-token"
                  type="password"
                  value={refreshToken}
                  onChange={(event) => setRefreshToken(event.target.value)}
                  placeholder="Recommended for background runs"
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="google-access-token">OAuth access token</Label>
                <Input
                  id="google-access-token"
                  type="password"
                  value={accessToken}
                  onChange={(event) => setAccessToken(event.target.value)}
                  placeholder="Accepted for short-lived tests"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="google-client-id">OAuth client ID</Label>
                <Input
                  id="google-client-id"
                  value={clientId}
                  onChange={(event) => setClientId(event.target.value)}
                  placeholder="Uses server env if empty"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="google-client-secret">OAuth client secret</Label>
                <Input
                  id="google-client-secret"
                  type="password"
                  value={clientSecret}
                  onChange={(event) => setClientSecret(event.target.value)}
                  placeholder="Uses server env if empty"
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="whatsapp-access-token">Cloud API access token</Label>
                <Input
                  id="whatsapp-access-token"
                  type="password"
                  value={accessToken}
                  onChange={(event) => setAccessToken(event.target.value)}
                />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="whatsapp-phone-id">Phone number ID</Label>
                <Input
                  id="whatsapp-phone-id"
                  value={phoneNumberId}
                  onChange={(event) => setPhoneNumberId(event.target.value)}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            disabled={
              saving ||
              !label.trim() ||
              (provider === "google_sheets"
                ? !accessToken.trim() && !refreshToken.trim()
                : !accessToken.trim() || !phoneNumberId.trim())
            }
            onClick={save}
          >
            {saving && <LoaderCircle className="size-4 animate-spin" />}
            Save connection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
