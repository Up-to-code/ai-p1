"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Workflow, Bot, CheckCircle2, FileCheck, Check, Sparkles, Database, Send } from "lucide-react";

interface ExampleProps {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  code: string;
  highlightedCode: {
    light: string;
    dark: string;
  };
}

interface ScrollSimulatorProps {
  brandName: string;
  examples: ExampleProps[];
}

export function ScrollSimulator({ brandName, examples }: ScrollSimulatorProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // Visual panel switcher rendering
  const renderVisualMockup = (index: number) => {
    switch (index) {
      case 0: // Permissions - OAuth Consent Dialog
        return (
          <motion.div
            key="permissions-mock"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full bg-zinc-50 dark:bg-[#0d1117] p-6 justify-between"
          >
            {/* Window title bar */}
            <div className="flex items-center gap-2 border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4 mb-4">
              <ShieldCheck className="size-5 text-primary" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">OAuth 2.1 Consent Authorization</span>
            </div>
            
            {/* Inner modal content */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="mx-auto size-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary mb-3 shadow-inner">
                <Sparkles className="size-5" />
              </div>
              <h4 className="text-center text-sm font-bold text-zinc-900 dark:text-white">
                Authorize CRM Integrator
              </h4>
              <p className="text-center text-[10px] text-zinc-500 dark:text-zinc-400 mt-1 px-4">
                This partner app wishes to connect to your <span className="font-bold text-zinc-900 dark:text-white">{brandName}</span> Workspace organization.
              </p>
              
              {/* Scopes List */}
              <div className="mt-5 space-y-2">
                <div className="flex items-start gap-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 p-2.5 shadow-sm dark:shadow-none">
                  <div className="size-4 rounded border border-primary bg-primary flex items-center justify-center text-primary-foreground shrink-0 mt-0.5">
                    <Check className="size-3 stroke-[3]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold leading-none text-zinc-900 dark:text-white">Read Clients & Contacts</p>
                    <p className="text-[9px] text-zinc-500 dark:text-zinc-500 mt-0.5">Access broker pipeline follow-ups and stages</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 p-2.5 shadow-sm dark:shadow-none">
                  <div className="size-4 rounded border border-primary bg-primary flex items-center justify-center text-primary-foreground shrink-0 mt-0.5">
                    <Check className="size-3 stroke-[3]" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold leading-none text-zinc-900 dark:text-white">Read Properties Listings</p>
                    <p className="text-[9px] text-zinc-500 dark:text-zinc-500 mt-0.5">Access Riyadh & Dammam verified unit records</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-6 grid grid-cols-2 gap-2.5">
                <div className="h-9 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md shadow-primary/10 cursor-pointer hover:bg-primary/95 transition-all">
                  Approve Access
                </div>
                <div className="h-9 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#0d1117] text-zinc-500 dark:text-zinc-400 text-xs font-bold flex items-center justify-center cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-all">
                  Cancel
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 1: // Webhooks - Event Stream Simulator
        return (
          <motion.div
            key="webhooks-mock"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full bg-zinc-50 dark:bg-[#0d1117] p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Workflow className="size-5 text-primary animate-pulse" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Outbound Webhook Delivery Logs</span>
              </div>
              <div className="size-2 rounded-full bg-primary animate-ping" />
            </div>

            {/* Event notifications list */}
            <div className="flex-1 flex flex-col gap-2.5 justify-center">
              {/* Event card 1 */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-start gap-3 shadow-sm">
                <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <CheckCircle2 className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] font-bold text-primary uppercase tracking-wider">client.created</span>
                    <span className="text-[8px] text-zinc-500 font-medium">1s ago</span>
                  </div>
                  <p className="text-[10px] text-zinc-950 dark:text-white font-semibold mt-0.5 truncate">
                    Broker added Client &apos;Sarah Al-Otaibi&apos;
                  </p>
                  <p className="text-[8px] font-mono text-zinc-500 dark:text-zinc-600 mt-0.5">Payload size: 1.2KB • Status: 200 OK</p>
                </div>
              </div>

              {/* Event card 2 */}
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 p-3 flex items-start gap-3 shadow-sm dark:shadow-none">
                <div className="size-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                  <CheckCircle2 className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[9px] font-bold text-primary uppercase tracking-wider">property.updated</span>
                    <span className="text-[8px] text-zinc-500 font-medium">4s ago</span>
                  </div>
                  <p className="text-[10px] text-zinc-950 dark:text-white font-semibold mt-0.5 truncate">
                    Listing Yasmin Villa price updated
                  </p>
                  <p className="text-[8px] font-mono text-zinc-500 dark:text-zinc-600 mt-0.5">Payload size: 2.4KB • Status: 200 OK</p>
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 2: // MCP - AI Agent Terminal simulator
        return (
          <motion.div
            key="mcp-mock"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full bg-zinc-50 dark:bg-[#0d1117] p-6"
          >
            {/* Terminal header */}
            <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Bot className="size-5 text-primary" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">AI Operator Assistant Terminal</span>
              </div>
              <span className="text-[9px] font-mono text-zinc-400 dark:text-zinc-600">MCP-Reviewed</span>
            </div>

            {/* Chat frame */}
            <div className="flex-1 flex flex-col justify-between">
              <div className="space-y-3.5">
                {/* Broker message */}
                <div className="flex items-end gap-2 justify-end">
                  <div className="rounded-2xl rounded-br-none bg-primary text-primary-foreground p-3 max-w-[85%]">
                    <p className="text-[10px] font-medium leading-relaxed">
                      &quot;Find active clients in Riyadh interested in Malqa area, check matching listings, and queue calendar coordinate tomorrow.&quot;
                    </p>
                  </div>
                </div>

                {/* AI calling tool indicators */}
                <div className="space-y-1.5 pl-2">
                  <div className="flex items-center gap-2 text-[9px] font-mono font-bold text-primary">
                    <div className="size-2 rounded-full border border-primary border-t-transparent animate-spin" />
                    <span>Executing tool: clients.search({`{ city: "Riyadh", tag: "Malqa" }`})</span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] font-mono font-bold text-primary">
                    <Check className="size-3 stroke-[3]" />
                    <span>Executing tool: listings.list({`{ area: "Al-Malqa", status: "Active" }`})</span>
                  </div>
                </div>

                {/* AI response bubble */}
                <div className="flex items-end gap-2 justify-start">
                  <div className="size-6 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-primary flex items-center justify-center shrink-0">
                    <Bot className="size-3.5" />
                  </div>
                  <div className="rounded-2xl rounded-bl-none border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 p-3 max-w-[85%] shadow-sm">
                    <p className="text-[10px] font-medium text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      I identified <span className="font-bold text-primary">3 buyers</span> ready for Malqa. Property record <span className="font-bold text-primary">Yasmin-42</span> matches perfectly. I have queued a viewing session for tomorrow at 10 AM.
                    </p>
                  </div>
                </div>
              </div>

              {/* Input Area */}
              <div className="mt-4 flex gap-2 border-t border-zinc-200/80 dark:border-zinc-800/80 pt-3">
                <div className="flex-1 h-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950/40 px-3 flex items-center text-[10px] text-zinc-400 dark:text-zinc-600 font-medium">
                  Queue automated broker follow-ups...
                </div>
                <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-md shadow-primary/10 shrink-0">
                  <Send className="size-3.5" />
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 3: // Clean Data - Property Grid Table
        return (
          <motion.div
            key="clean-data-mock"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full bg-zinc-50 dark:bg-[#0d1117] p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <Database className="size-5 text-primary" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Normalized Saudi Registry Schema</span>
              </div>
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[8px] font-bold text-primary">
                100% Sync
              </span>
            </div>

            {/* Listings Grid */}
            <div className="flex-1 flex flex-col justify-center">
              <div className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/10 shadow-sm dark:shadow-none">
                <table className="w-full text-left border-collapse text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100/50 dark:bg-zinc-900/30 font-bold text-zinc-400 dark:text-zinc-500">
                      <th className="px-3 py-2 text-[8px] uppercase tracking-wider">Property ID</th>
                      <th className="px-3 py-2 text-[8px] uppercase tracking-wider">Location</th>
                      <th className="px-3 py-2 text-[8px] uppercase tracking-wider">Pricing</th>
                      <th className="px-3 py-2 text-[8px] uppercase tracking-wider">Registry</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    <tr>
                      <td className="px-3 py-2 font-mono font-bold text-primary">PROP-YAS-04</td>
                      <td className="px-3 py-2">Al-Yasmin, Riyadh</td>
                      <td className="px-3 py-2 font-bold">SAR 3,600,000</td>
                      <td className="px-3 py-2 text-primary font-bold">✓ Active</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-mono font-bold text-primary">PROP-MAL-12</td>
                      <td className="px-3 py-2">Al-Malqa, Riyadh</td>
                      <td className="px-3 py-2 font-bold">SAR 4,500,000</td>
                      <td className="px-3 py-2 text-primary font-bold">✓ Active</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-2 font-mono font-bold text-primary">PROP-NAF-08</td>
                      <td className="px-3 py-2">Al-Nafal, Riyadh</td>
                      <td className="px-3 py-2 font-bold">SAR 1,850,000</td>
                      <td className="px-3 py-2 text-amber-500 font-bold">● Pending</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 rounded-lg bg-zinc-100/50 dark:bg-zinc-900/20 p-2.5 border border-zinc-200 dark:border-zinc-800">
                <p className="text-[9px] text-zinc-500 dark:text-zinc-500 leading-relaxed leading-3">
                  <span className="font-bold text-zinc-700 dark:text-zinc-400">Sync parity:</span> Arabic Cairo font names, Riyal pricing formulas, and official registry numbers are pre-parsed and scrubbed.
                </p>
              </div>
            </div>
          </motion.div>
        );

      case 4: // Review - Approval Checklist lifecycle
        return (
          <motion.div
            key="review-mock"
            initial={{ opacity: 0, scale: 0.96, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col h-full bg-zinc-50 dark:bg-[#0d1117] p-6"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-200/80 dark:border-zinc-800/80 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="size-5 text-primary" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Developer Publisher Console</span>
              </div>
              <span className="font-mono text-[9px] font-bold text-primary uppercase">v1.0.0</span>
            </div>

            {/* Checklist */}
            <div className="flex-1 flex flex-col justify-center">
              <h4 className="text-xs font-bold text-zinc-900 dark:text-white mb-3">Integrator App Approval Checklist</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 shadow-sm dark:shadow-none">
                  <div className="flex items-center gap-2">
                    <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <Check className="size-2.5 stroke-[3]" />
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">OAuth Configuration Complete</span>
                  </div>
                  <span className="text-[8px] font-bold uppercase text-primary">Verified</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 shadow-sm dark:shadow-none">
                  <div className="flex items-center gap-2">
                    <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <Check className="size-2.5 stroke-[3]" />
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">Least-Privilege Scope Check</span>
                  </div>
                  <span className="text-[8px] font-bold uppercase text-primary">Verified</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/20 shadow-sm dark:shadow-none">
                  <div className="flex items-center gap-2">
                    <div className="size-4 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                      <Check className="size-2.5 stroke-[3]" />
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-700 dark:text-zinc-300">Sandbox Security Assessment</span>
                  </div>
                  <span className="text-[8px] font-bold uppercase text-primary">Verified</span>
                </div>
              </div>

              {/* Status Badge callout */}
              <div className="mt-6 flex flex-col items-center justify-center border border-primary/20 bg-primary/5 rounded-xl p-4 shadow-sm">
                <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-2 animate-bounce">
                  <Check className="size-5 stroke-[3]" />
                </div>
                <span className="text-xs font-bold text-zinc-900 dark:text-white leading-none">App Reviewed & Published</span>
                <span className="text-[8px] text-primary font-bold uppercase mt-1 tracking-widest">Active catalog listing</span>
              </div>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="relative grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(480px,1fr)] items-start">
      
      {/* Scrollable Value Sections (Left Column) */}
      <div className="flex flex-col gap-20 lg:gap-32 py-10">
        {examples.map((example, index) => (
          <motion.div
            key={example.title}
            onViewportEnter={() => setActiveIndex(index)}
            viewport={{ amount: 0.55 }}
            className={`flex flex-col justify-center min-h-[50vh] border-l pl-6 lg:pl-8 transition-all duration-300 ${
              activeIndex === index 
                ? "border-primary opacity-100" 
                : "border-zinc-200 dark:border-zinc-800 opacity-35 dark:opacity-30 hover:opacity-75 dark:hover:opacity-60"
            }`}
          >
            <span className="text-xs font-black uppercase tracking-widest text-primary">
              {example.eyebrow}
            </span>
            <h3 className="mt-3 text-3xl font-extrabold leading-tight text-zinc-900 dark:text-white tracking-tight font-sans">
              {example.title}
            </h3>
            <p className="mt-4 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-xl">
              {example.description}
            </p>
            
            {/* INLINE CUSTOM CODE EDITOR MOCKUP - Tactile Developer Experience */}
            <div className="mt-6 overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#07090c]/90 text-[11px] font-mono leading-relaxed max-w-xl code-zone-shadow">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/30 px-3.5 py-2 text-[9px] text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-black">
                <span>{example.eyebrow.toLowerCase().replace(" ", "-")}.ts</span>
                <span>TypeScript SDK</span>
              </div>
              <div className="p-4 overflow-auto scrollbar-none max-h-[160px]">
                {/* Light mode pre-rendered code */}
                <div 
                  dangerouslySetInnerHTML={{ __html: example.highlightedCode.light }} 
                  className="block dark:hidden [&_pre]:bg-transparent [&_pre]:p-0 [&_pre]:m-0 [&_pre]:font-mono [&_pre]:text-[11px]" 
                />
                {/* Dark mode pre-rendered code */}
                <div 
                  dangerouslySetInnerHTML={{ __html: example.highlightedCode.dark }} 
                  className="hidden dark:block [&_pre]:bg-transparent [&_pre]:p-0 [&_pre]:m-0 [&_pre]:font-mono [&_pre]:text-[11px]" 
                />
              </div>
            </div>

            {/* Visual Indicators list */}
            <div className="mt-6 flex flex-wrap gap-2">
              {example.bullets.map((bullet) => (
                <div
                  key={bullet}
                  className="flex items-center gap-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/40 px-3 py-1.5 text-[10px] font-bold text-zinc-700 dark:text-zinc-300"
                >
                  <CheckCircle2 className="size-3.5 text-primary shrink-0" />
                  {bullet}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Sticky Visualization Frame (Right Column) */}
      <div className="sticky top-28 hidden lg:block h-[420px] w-full z-20">
        <div className="relative h-full w-full rounded-2xl border border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-950/30 backdrop-blur-md overflow-hidden code-zone-shadow flex flex-col justify-between">
          
          {/* Simulated Browser window wrapper */}
          <div className="absolute inset-0 flex flex-col">
            <AnimatePresence mode="wait">
              {renderVisualMockup(activeIndex)}
            </AnimatePresence>
          </div>

        </div>
      </div>

    </div>
  );
}
