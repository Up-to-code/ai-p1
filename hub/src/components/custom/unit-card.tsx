"use client";

import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/custom/status-badge";
import { BedDouble, Building2, MapPin, Ruler, MoreHorizontal, Edit, Trash2 } from "lucide-react";
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

export interface Unit {
  title: string;
  reference: string;
  project: string;
  city: string;
  type: string;
  image: string;
  status: "draft" | "pending" | "approved" | "rejected" | "available" | "sold" | "reserved";
  price: string;
  area: string;
  bedrooms: number | "Studio";
  bathrooms: number;
  syncState: "draft" | "blocked" | "synced";
  updated: string;
}

export function UnitCard({
  title,
  reference,
  project,
  city,
  type,
  image,
  status,
  price,
  area,
  bedrooms,
  syncState,
  updated,
}: Unit) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  return (
    <>
      <Card className="border-zinc-200 bg-white shadow-none overflow-hidden group hover:border-zinc-300 transition-all duration-300 rounded-[20px]">
        <div 
          onClick={() => router.push(`/properties/${reference}`)}
          className="relative h-48 overflow-hidden cursor-pointer"
        >
        {image ? (
          <Image
            src={image}
            alt={title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-50">
            <Building2 className="h-10 w-10 text-zinc-200" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        <div className="absolute end-4 top-4">
          <StatusBadge status={status} className="bg-white/90 backdrop-blur-sm border-0 text-zinc-900" />
        </div>
        <div className="absolute bottom-4 start-4 end-4">
          <h3 className="truncate text-xl font-bold leading-tight text-white tracking-tight">{title}</h3>
          <div className="mt-1.5 flex items-center gap-1.5 opacity-90">
            <MapPin className="h-3.5 w-3.5 text-white" />
            <span className="truncate text-[13px] font-medium text-white">{city}</span>
          </div>
        </div>
      </div>

      <CardContent className="space-y-5 p-5 bg-zinc-50/50">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold tracking-widest text-zinc-400 uppercase">{reference}</span>
            <StatusBadge status={syncState} />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="h-8 w-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-zinc-100">
                <MoreHorizontal className="h-4 w-4" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-zinc-100">
              <DropdownMenuItem onClick={() => router.push(`/properties/${reference}/edit`)} className="rounded-lg">
                <Edit className="w-4 h-4 me-2 text-zinc-500" />
                Edit Unit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500 rounded-lg focus:bg-red-50 focus:text-red-600" onClick={() => setShowDeleteDialog(true)}>
                <Trash2 className="w-4 h-4 me-2" />
                Delete Unit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div>
          <p className="truncate text-sm font-semibold text-zinc-800">{project}</p>
          <p className="mt-1 text-[13px] font-bold text-zinc-900">{price}</p>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-1">
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Type</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[13px] font-semibold text-zinc-800">
              <Building2 className="h-3.5 w-3.5 text-zinc-400" />
              <span className="truncate">{type}</span>
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Area</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[13px] font-semibold text-zinc-800">
              <Ruler className="h-3.5 w-3.5 text-zinc-400" />
              <span className="truncate">{area}</span>
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Rooms</p>
            <p className="mt-0.5 flex items-center gap-1.5 text-[13px] font-semibold text-zinc-800">
              <BedDouble className="h-3.5 w-3.5 text-zinc-400" />
              {bedrooms}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-zinc-100 pt-4">
          <p className="text-[11px] font-medium text-zinc-400">Updated {updated}</p>
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        </div>
      </CardContent>
    </Card>

    <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Unit</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <span className="font-semibold text-foreground">{title}</span>? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-red-500 hover:bg-red-600 text-white" onClick={() => setShowDeleteDialog(false)}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </>
  );
}
