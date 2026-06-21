"use client";

import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@convex/_generated/api";
import { type Id } from "@convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Download, AlertCircle, Loader2, FileIcon } from "lucide-react";

export default function PublicSharedFilePage() {
  const params = useParams();
  const mediaId = params.mediaId as Id<"mediaAssets">;

  const data = useQuery(api.media.read.getForPublicRoute, { mediaId });

  if (data === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (data === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center p-4">
        <div className="h-20 w-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6">
          <AlertCircle className="h-10 w-10" />
        </div>
        <h1 className="text-2xl font-black text-foreground mb-2">File Unavailable</h1>
        <p className="text-sm font-medium text-muted-foreground max-w-sm">
          This file may have been deleted, or the workspace owner has securely disabled public access.
        </p>
      </div>
    );
  }

  const { asset, organization } = data;

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Header */}
      <header className="sticky top-0 z-10 flex h-[72px] items-center justify-between border-b border-border bg-card/80 px-6 backdrop-blur-xl shadow-sm">
        <div className="flex items-center gap-3">
          {organization.logo ? (
            <img src={organization.logo} alt={organization.name} className="h-9 w-9 rounded-xl object-cover shadow-sm ring-1 ring-border/50" />
          ) : (
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs uppercase shadow-sm ring-1 ring-primary/20">
              {organization.name.substring(0, 2)}
            </div>
          )}
          <div className="flex flex-col">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Shared by</span>
            <span className="font-bold text-foreground text-sm leading-none">{organization.name}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <a href={asset.url} download>
            <Button className="font-bold text-xs h-9 rounded-xl shadow-sm">
              <Download className="mr-2 h-4 w-4" />
              Download File
            </Button>
          </a>
        </div>
      </header>

      {/* Main Viewer Area */}
      <main className="flex-1 flex flex-col p-6 items-center justify-center">
        <div className="w-full max-w-5xl bg-card border border-border rounded-2xl shadow-xl overflow-hidden flex flex-col ring-1 ring-black/5 dark:ring-white/5">
          <div className="p-5 border-b border-border flex items-center gap-4 bg-muted/20">
            <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <FileIcon className="h-6 w-6" />
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <h2 className="font-black text-lg text-foreground truncate">{asset.name}</h2>
              <p className="text-[11px] font-bold uppercase text-muted-foreground tracking-wider">
                {asset.kind} • {(asset.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>
          
          <div className="relative w-full bg-muted/10 flex items-center justify-center p-6" style={{ minHeight: "65vh" }}>
            {asset.kind === "image" && (
              <img src={asset.url} alt={asset.name} className="max-w-full max-h-[75vh] object-contain rounded-xl shadow-md ring-1 ring-border" />
            )}
            
            {asset.kind === "video" && (
              <video src={asset.url} controls className="max-w-full max-h-[75vh] rounded-xl shadow-md ring-1 ring-border bg-black" />
            )}
            
            {asset.kind === "document" && (
              <iframe src={asset.url} title={asset.name} className="w-full h-[75vh] rounded-xl shadow-md ring-1 ring-border bg-white" />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
