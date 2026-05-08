"use client";

import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/custom/status-badge";
import { 
  MoreHorizontal, Edit, Trash2, User, Briefcase, CircleDollarSign,
  Building2, Mail, AlertCircle, Globe, Activity, Eye
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useRouter } from "@/i18n/routing";
import { useState } from "react";
import { cn } from "@/lib/utils";

export interface Client {
  id: string;
  name: string;
  type: "Buyer" | "Tenant" | "Investor" | "Broker";
  contact: string;
  phone?: string;
  age: number;
  nationality: string;
  generation: string;
  budget: string;
  propertyInterest: string;
  issue: string;
  status: "active" | "inactive";
  added: string;
  syncState?: "draft" | "eligible" | "synced" | "blocked" | "failed";
  visibility?: "visible" | "hidden";
}

function getTypeConfig(type: string) {
  switch (type) {
    case "Buyer":
      return { icon: User, color: "bg-violet-500/10 text-violet-600", border: "border-violet-500/30" };
    case "Tenant":
      return { icon: Building2, color: "bg-blue-500/10 text-blue-600", border: "border-blue-500/30" };
    case "Investor":
      return { icon: CircleDollarSign, color: "bg-emerald-500/10 text-emerald-600", border: "border-emerald-500/30" };
    case "Broker":
      return { icon: Briefcase, color: "bg-amber-500/10 text-amber-600", border: "border-amber-500/30" };
    default:
      return { icon: User, color: "bg-primary/10 text-primary", border: "border-primary/30" };
  }
}

export function ClientCard({
  id,
  name,
  type,
  contact,
  age,
  nationality,
  budget,
  propertyInterest,
  issue,
  status,
  syncState = "draft",
  visibility = "hidden",
}: Client) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const typeConfig = getTypeConfig(type);
  const TypeIcon = typeConfig.icon;

  return (
    <>
      <Card className="group overflow-hidden border-border/60 shadow-none transition-all duration-300 hover:shadow-none hover:border-border bg-background">
        <CardContent className="p-5 space-y-4">
          {/* Header: Avatar + Name + Actions */}
          <div className="flex items-start justify-between">
            <div 
              className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
              onClick={() => router.push(`/clients/${id}`)}
            >
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105", typeConfig.color)}>
                <span className="text-lg font-bold">{name.charAt(0)}</span>
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-text-primary truncate group-hover:text-primary transition-colors">{name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={cn("inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border", typeConfig.color, typeConfig.border)}>
                    <TypeIcon className="w-3 h-3" />
                    {type}
                  </span>
                  <StatusBadge status={status === "active" ? "approved" : "draft"} label={status === "active" ? "Active" : "Inactive"} />
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center justify-center rounded-md hover:bg-background-elevated h-8 w-8 text-text-muted hover:text-text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => router.push(`/clients/${id}`)} className="cursor-pointer">
                  <User className="w-4 h-4 me-2" /> View Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push(`/clients/${id}/edit`)} className="cursor-pointer">
                  <Edit className="w-4 h-4 me-2" /> Edit Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="cursor-pointer text-red-500 focus:bg-red-50 focus:text-red-600 dark:focus:bg-red-500/10"
                  onClick={() => setShowDeleteDialog(true)}
                >
                  <Trash2 className="w-4 h-4 me-2" /> Delete Client
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Sync Status Row */}
          <div className="flex items-center gap-4 py-2 border-y border-border/40">
            <div className="flex items-center gap-1.5 text-sm">
              <Activity className="w-4 h-4 text-text-muted" />
              <span className={cn(
                "font-medium capitalize",
                syncState === "synced" ? "text-success" :
                syncState === "failed" || syncState === "blocked" ? "text-orange-500" :
                "text-text-muted"
              )}>
                {syncState}
              </span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5 text-sm">
              <Eye className="w-4 h-4 text-text-muted" />
              <span className={cn(
                "font-medium capitalize",
                visibility === "visible" ? "text-success" : "text-text-muted"
              )}>
                {visibility}
              </span>
            </div>
            <div className="w-px h-4 bg-border" />
            <div className="flex items-center gap-1.5 text-sm text-text-muted truncate min-w-0">
              <Mail className="w-4 h-4 shrink-0" />
              <span className="truncate">{contact}</span>
            </div>
          </div>

          {/* Budget & Interest */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Budget</p>
              <p className="text-sm font-semibold text-text-primary mt-1 truncate">{budget}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Interest</p>
              <p className="text-sm font-medium text-text-primary mt-1 truncate">{propertyInterest}</p>
            </div>
          </div>

          {/* Open Issue */}
          {issue && (
            <div className="flex items-start gap-2 p-2.5 bg-orange-500/5 border border-orange-500/20 rounded-lg">
              <AlertCircle className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
              <p className="text-xs text-text-primary leading-relaxed">{issue}</p>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-text-muted">
              <Globe className="w-3.5 h-3.5" /> {nationality} • {age}y
            </div>
            <span className="text-[10px] font-mono text-text-muted">{id.toUpperCase()}</span>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Client Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <span className="font-semibold text-foreground">{name}</span>? This will remove their profile, requirements, deals, and tasks permanently. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={() => setShowDeleteDialog(false)}>
              Delete Record
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
