"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Users, ArrowRight, Link2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Choice = "join" | "create" | null;

export default function ChooseOrgPage() {
  const [choice, setChoice] = useState<Choice>(null);

  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary mb-2">Welcome to Anand Hub</h1>
        <p className="text-text-secondary">How would you like to get started?</p>
      </div>

      {/* Option Cards */}
      <div className="grid gap-4">
        {/* Join Organization */}
        <button
          onClick={() => setChoice(choice === "join" ? null : "join")}
          className={cn(
            "w-full text-start p-5 rounded-xl border-2 transition-all duration-200 bg-background hover:shadow-none cursor-pointer",
            choice === "join"
              ? "border-primary shadow-none"
              : "border-border/60 hover:border-border"
          )}
        >
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
              choice === "join" ? "bg-primary/10 text-primary" : "bg-surface text-text-secondary border border-border/60"
            )}>
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-text-primary">I was invited to an organization</h3>
              <p className="text-sm text-text-secondary mt-1">Enter an invite code or use a shared link to join an existing workspace.</p>
            </div>
          </div>
        </button>

        {/* Join Expansion */}
        {choice === "join" && (
          <Card className="border-border/60 shadow-none bg-surface/30 animate-in fade-in slide-in-from-top-2 duration-200">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="inviteCode" className="text-sm font-medium">Invite Code or Link</Label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Link2 className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                    <Input
                      id="inviteCode"
                      placeholder="e.g. INV-8X3K9 or paste invite link"
                      className="h-10 ps-10 border-border/60 focus-visible:ring-primary/20"
                    />
                  </div>
                  <Button className="h-10 shrink-0">
                    Join
                    <ArrowRight className="ms-2 w-4 h-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-text-muted">
                Ask your organization admin for an invite code, or check your email for an invitation link.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Create Organization */}
        <button
          onClick={() => setChoice(choice === "create" ? null : "create")}
          className={cn(
            "w-full text-start p-5 rounded-xl border-2 transition-all duration-200 bg-background hover:shadow-none cursor-pointer",
            choice === "create"
              ? "border-primary shadow-none"
              : "border-border/60 hover:border-border"
          )}
        >
          <div className="flex items-start gap-4">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center shrink-0 transition-colors",
              choice === "create" ? "bg-primary/10 text-primary" : "bg-surface text-text-secondary border border-border/60"
            )}>
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-medium text-text-primary">Create a new organization</h3>
              <p className="text-sm text-text-secondary mt-1">Register your company and complete the setup wizard to start synchronizing data.</p>
            </div>
          </div>
        </button>

        {/* Create Expansion */}
        {choice === "create" && (
          <Card className="border-border/60 shadow-none bg-surface/30 animate-in fade-in slide-in-from-top-2 duration-200">
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orgName" className="text-sm font-medium">Organization Name</Label>
                <Input
                  id="orgName"
                  placeholder="e.g. Acme Real Estate"
                  className="h-10 border-border/60 focus-visible:ring-primary/20"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="orgType" className="text-sm font-medium">Organization Type</Label>
                <Select>
                  <SelectTrigger className="h-10 border-border/60 focus:ring-primary/20">
                    <SelectValue placeholder="Select your organization type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="broker">Broker</SelectItem>
                    <SelectItem value="developer">Developer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Link href="/onboarding">
                <Button className="w-full h-10 font-medium shadow-none">
                  Create Organization
                  <ArrowRight className="ms-2 w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
