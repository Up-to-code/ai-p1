"use client";
import Image from "next/image";
import { Ruler, Bed, MoreHorizontal, Trash2, ArrowUpRight, Copy, ExternalLink, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "@/i18n/routing";
import { useTranslations } from "next-intl";

interface PropertyCardProps {
  id: string;
  title: string;
  reference: string;
  project: string;
  city: string;
  type: string;
  image: string;
  status: 'available' | 'sold' | 'reserved' | 'pending' | 'draft';
  price: string;
  area: string;
  bedrooms: number | string;
  bathrooms: number;
  updated: string;
  className?: string;
}

export function PropertyCard({
  id,
  title,
  reference,
  project,
  image,
  status,
  price,
  area,
  bedrooms,
  bathrooms,
  updated,
  className,
}: PropertyCardProps) {
  const router = useRouter();
  const t = useTranslations("Statuses");
  const ta = useTranslations("ProjectDetails.actions");

  return (
    <div className={cn(
      "group relative flex flex-col bg-white dark:bg-[#0A0A0A] border border-zinc-100 dark:border-white/5 rounded-[24px] overflow-hidden transition-all duration-300 hover:border-zinc-400 dark:hover:border-white/20 shadow-none",
      className
    )}>
      {/* COMPACT Visual Anchor */}
      <div 
        onClick={() => router.push(`/properties/${id}`)} 
        className="relative h-40 overflow-hidden cursor-pointer bg-zinc-100 dark:bg-white/5"
      >
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-700 grayscale group-hover:grayscale-0 group-hover:scale-105 opacity-80 group-hover:opacity-100"
        />
        
        <div className="absolute top-4 right-4 rtl:right-auto rtl:left-4">
           <div className={cn("px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-[0.2em] leading-none shadow-none text-white", status === 'available' ? "bg-emerald-500" : status === 'pending' ? "bg-amber-500" : "bg-zinc-400")}>
              {t(status)}
           </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
           <div className="flex items-end justify-between">
              <div className="space-y-0.5 min-w-0">
                 <h3 className="text-white font-black text-sm tracking-tighter uppercase leading-none truncate">{title}</h3>
                 <div className="flex items-center gap-1.5 opacity-60">
                    <Building className="h-2 w-2 text-white" />
                    <span className="text-white text-[8px] font-black uppercase tracking-[0.2em] truncate">{project}</span>
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
              status === 'available' ? "bg-emerald-500" : "bg-amber-500"
            )} />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger>
              <div className="h-6 w-6 rounded-full flex items-center justify-center text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-all cursor-pointer focus:outline-none">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border border-zinc-100 dark:border-white/5 bg-white dark:bg-zinc-900 shadow-none p-1">
              <DropdownMenuItem onClick={() => router.push(`/properties/${id}`)} className="rounded-lg px-4 py-2 font-black text-[9px] uppercase tracking-widest cursor-pointer gap-3">
                <ExternalLink className="h-3.5 w-3.5 text-zinc-400" />
                {ta('view')}
              </DropdownMenuItem>
              <DropdownMenuItem className="rounded-lg px-4 py-2 font-black text-[9px] uppercase tracking-widest cursor-pointer gap-3">
                <Copy className="h-3.5 w-3.5 text-zinc-400" />
                {ta('duplicate')}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-100 dark:bg-white/5" />
              <DropdownMenuItem className="text-red-500 rounded-lg px-4 py-2 font-black text-[9px] uppercase tracking-widest focus:bg-red-50 dark:focus:bg-red-500/10 cursor-pointer gap-3">
                <Trash2 className="h-3.5 w-3.5" />
                {ta('delete')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-2 gap-2">
           <div className="bg-zinc-50 dark:bg-white/[0.01] p-3 rounded-xl border border-zinc-50 dark:border-white/5">
              <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Area</p>
              <div className="flex items-center gap-2">
                 <Ruler className="h-3 w-3 text-zinc-300" />
                 <span className="text-[10px] font-black text-zinc-900 dark:text-white uppercase truncate">{area}</span>
              </div>
           </div>
           <div className="bg-zinc-50 dark:bg-white/[0.01] p-3 rounded-xl border border-zinc-50 dark:border-white/5">
              <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1">Layout</p>
              <div className="flex items-center gap-2">
                 <Bed className="h-3 w-3 text-zinc-300" />
                 <span className="text-[10px] font-black text-zinc-900 dark:text-white uppercase">{bedrooms}B / {bathrooms}BA</span>
              </div>
           </div>
        </div>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-zinc-100 dark:border-white/5">
           <div className="space-y-0.5">
              <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Price</p>
              <p className="text-[11px] font-black text-zinc-900 dark:text-white tracking-tighter">{price} SAR</p>
           </div>
           <div className="text-right space-y-0.5">
              <p className="text-[8px] font-black text-zinc-400 uppercase tracking-widest">Mod</p>
              <p className="text-[9px] font-black text-zinc-500 uppercase">{updated}</p>
           </div>
        </div>
      </div>
    </div>
  );
}
