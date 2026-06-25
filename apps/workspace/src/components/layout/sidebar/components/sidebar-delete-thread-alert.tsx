"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
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
import type { AgentThread } from "../lib/types";

type SidebarDeleteThreadAlertProps = {
  thread: AgentThread | null;
  deleting: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
};

export function SidebarDeleteThreadAlert({
  thread,
  deleting,
  onOpenChange,
  onConfirm,
}: SidebarDeleteThreadAlertProps) {
  const tThreads = useTranslations("Sidebar.threads");

  return (
    <AlertDialog open={Boolean(thread)} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{tThreads("deleteTitle")}</AlertDialogTitle>
          <AlertDialogDescription>{tThreads("deleteDescription")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>{tThreads("cancel")}</AlertDialogCancel>
          <AlertDialogAction
            disabled={deleting}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            className="bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500/20 dark:bg-red-500 dark:text-white dark:hover:bg-red-400"
          >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            {tThreads("delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
