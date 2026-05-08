"use client";
import Image from "next/image";
import { MapPin, House, Building2, MoreHorizontal, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";
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

interface ProjectCardProps {
  name: string;
  reference: string;
  city: string;
  type: string;
  image: string;
  status: "draft" | "pending" | "approved" | "rejected";
  units: number;
  syncState: "draft" | "blocked" | "synced";
  priceRange: string;
  updated: string;
  className?: string;
}

export function ProjectCard({
  name,
  reference,
  city,
  type,
  image,
  status,
  units,
  syncState,
  priceRange,
  updated,
  className,
}: ProjectCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <div className={cn(
        "group relative flex flex-col bg-white dark:bg-[#0A0A0A] border border-zinc-100 dark:border-white/5 rounded-[24px] overflow-hidden transition-all duration-300 hover:border-zinc-400 dark:hover:border-white/20 shadow-none",
        className
      )}>
        {/* COMPACT Visual Anchor */}
        <div 
          onClick={() => router.push(`/projects/${reference}`)} 
          className="relative h-44 overflow-hidden cursor-pointer bg-zinc-100 dark:bg-white/5"
        >
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover transition-transform duration-700 grayscale group-hover:grayscale-0 group-hover:scale-105 opacity-80 group-hover:opacity-100"
          />
          
          <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4">
            <div className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-full px-3 py-1 font-black text-[8px] uppercase tracking-[0.2em]">
               {status}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
             <div className="flex items-end justify-between">
                <div className="space-y-0.5 min-w-0">
                   <h3 className="text-white font-black text-sm tracking-tighter uppercase leading-none truncate">{name}</h3>
                   <div className="flex items-center gap-1.5 opacity-60">
                      <MapPin className="h-2 w-2 text-white" />
                      <span className="text-white text-[8px] font-black uppercase tracking-[0.2em] truncate">{city}</span>
                   </div>
                </div>
                <div className="h-8 w-8 rounded-full bg-white text-zinc-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90">
                   <ArrowUpRight className="h-4 w-4" />
                </div>
             </div>
          </div>
        </div>

        {/* COMPACT Institutional Details */}
        <div className="p-4 space-y-4 flex-1 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black tracking-[0.2em] text-zinc-300 dark:text-zinc-700 uppercase">{reference}</span>
              <div className={cn(
                "h-1 w-1 rounded-full",
                syncState === 'synced' ? "bg-emerald-500" : "bg-amber-500"
              )} />
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger>
                <div className="h-6 w-6 rounded-full flex items-center justify-center text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-all cursor-pointer">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl border border-zinc-100 dark:border-white/5 bg-white dark:bg-zinc-900 shadow-none">
                <DropdownMenuItem onClick={() => router.push(`/projects/${reference}/edit`)} className="rounded-lg px-4 py-2 font-black text-[9px] uppercase tracking-widest cursor-pointer">
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-zinc-100 dark:bg-white/5" />
                <DropdownMenuItem className="text-red-500 rounded-lg px-4 py-2 font-black text-[9px] uppercase tracking-widest focus:bg-red-50 dark:focus:bg-red-500/10 cursor-pointer" onClick={() => setShowDeleteDialog(true)}>
                  Purge
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid grid-cols-2 gap-2">
             <div className="bg-zinc-50 dark:bg-white/[0.01] p-3 rounded-xl border border-zinc-50 dark:border-white/5">
                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Type</p>
                <div className="flex items-center gap-2">
                   <Building2 className="h-3 w-3 text-zinc-300" />
                   <span className="text-[10px] font-black text-zinc-900 dark:text-white uppercase truncate">{type}</span>
                </div>
             </div>
             <div className="bg-zinc-50 dark:bg-white/[0.01] p-3 rounded-xl border border-zinc-50 dark:border-white/5">
                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Units</p>
                <div className="flex items-center gap-2">
                   <House className="h-3 w-3 text-zinc-300" />
                   <span className="text-[10px] font-black text-zinc-900 dark:text-white">{units}</span>
                </div>
             </div>
          </div>

          <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-100 dark:border-white/5">
             <div className="space-y-0.5">
                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Value</p>
                <p className="text-[11px] font-black text-zinc-900 dark:text-white tracking-tighter">{priceRange}</p>
             </div>
             <div className="text-right space-y-0.5">
                <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Mod</p>
                <p className="text-[9px] font-black text-zinc-500 uppercase">{updated}</p>
             </div>
          </div>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="rounded-[32px] border border-zinc-100 dark:border-white/5 bg-white dark:bg-[#0A0A0A] shadow-none max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black tracking-tighter uppercase">Purge Asset?</AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-bold text-zinc-500">
              Removing <span className="text-zinc-900 dark:text-white">{name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className="rounded-xl font-black uppercase text-[9px] tracking-widest border border-zinc-100 h-10 px-6">Abort</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white rounded-xl font-black uppercase text-[9px] tracking-widest border-0 h-10 px-6 shadow-none" onClick={() => setShowDeleteDialog(false)}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
