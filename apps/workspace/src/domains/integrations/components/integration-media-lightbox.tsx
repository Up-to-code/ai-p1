"use client";

import { Pause } from "lucide-react";
import type { IntegrationAppDetails } from "../lib/integration-app-details";

export function IntegrationMediaLightbox({
  activeMedia,
  mockDetails,
  liveDemoLabel,
  onClose,
}: {
  activeMedia: "video" | "screenshot";
  mockDetails: IntegrationAppDetails;
  liveDemoLabel: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 transition-all duration-300 animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-foreground rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 h-8 w-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center text-white text-xl font-bold transition active:scale-95 select-none"
        >
          &times;
        </button>

        {activeMedia === "video" ? (
          <div className="aspect-video relative w-full bg-black flex flex-col justify-between p-6">
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-0" />

            <div className="z-10 flex justify-between items-start">
              <span className="rounded bg-red-655 px-2 py-0.5 text-[9px] font-black text-white tracking-wide animate-pulse">
                {liveDemoLabel}
              </span>
              <span className="text-[10px] font-mono text-muted-foreground">{mockDetails.videoDuration}</span>
            </div>

            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/40 shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-transform duration-300">
                <Pause className="h-6 w-6 fill-white text-white" />
              </div>
            </div>

            <div className="z-10 space-y-3 text-start">
              <h3 className="text-sm font-bold text-white tracking-tight">{mockDetails.videoTitle}</h3>
              <div className="flex items-center gap-3 text-xs font-mono text-muted-foreground">
                <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div className="w-1/2 h-full bg-blue-500 animate-pulse" />
                </div>
                <span>1:20 / {mockDetails.videoDuration}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="aspect-video w-full bg-foreground flex items-center justify-center overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={mockDetails.screenshotImgUrl} alt="" className="max-h-full max-w-full object-contain" />
          </div>
        )}
      </div>
    </div>
  );
}
