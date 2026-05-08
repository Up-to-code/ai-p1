"use client";

import { useState } from "react";
import AiComposer from "./ai-composer";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function DashboardChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const t = useTranslations('Assistant');

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    
    const userMessage: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);

    // Mock AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        role: "assistant",
        content: `I've analyzed your request about "${text}". Based on current synchronization data, I can help you process this in the workspace.`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsSending(false);
    }, 1500);
  };

  return (
    <div className="flex h-full flex-col relative bg-white dark:bg-transparent overflow-hidden">
      {messages.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center p-4">
          <div className="max-w-2xl w-full text-center space-y-12">
            <div className="space-y-4">
               <h2 className="text-4xl font-black text-zinc-900 dark:text-white tracking-tight uppercase leading-tight">
                 {t('welcome')}
               </h2>
            </div>
            
            <div className="relative group">
              <AiComposer 
                value={inputValue}
                onChange={setInputValue}
                onSend={handleSend} 
                layout="landing"
                placeholder={t('inputPlaceholder')}
                isSending={isSending}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
              {[
                { label: "Find data", icon: "🔍" },
                { label: "New Project", icon: "🏗️" },
                { label: "Verify claims", icon: "✅" },
                { label: "Reports", icon: "📊" }
              ].map((pill) => (
                <button key={pill.label} className="flex items-center justify-center gap-2 rounded-xl border border-zinc-100 bg-white p-3 text-[10px] font-black uppercase tracking-widest text-zinc-400 transition-all hover:border-zinc-300 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900/50">
                  <span>{pill.icon}</span>
                  {pill.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-12 scroll-smooth pb-32">
            <div className="max-w-4xl mx-auto space-y-12">
              {messages.map((msg, i) => (
                <div key={i} className="flex flex-col gap-3 group animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                      {msg.role === "user" ? "you" : "anan pro"}
                    </span>
                    <div className="h-px flex-1 bg-zinc-50 dark:bg-zinc-900" />
                  </div>
                  <div className={cn(
                    "text-lg font-medium leading-relaxed tracking-tight",
                    msg.role === "user" ? "text-zinc-600 dark:text-zinc-400" : "text-zinc-900 dark:text-white"
                  )}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-white via-white/90 to-transparent dark:from-slate-950 dark:via-slate-950/90">
             <div className="max-w-4xl mx-auto">
                <AiComposer 
                  value={inputValue}
                  onChange={setInputValue}
                  onSend={handleSend} 
                  layout="thread"
                  isSending={isSending}
                />
             </div>
          </div>
        </>
      )}
    </div>
  );
}
