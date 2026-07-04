"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload, FileText, Image, Link as LinkIcon, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type ActionTab = "upload" | "document" | "image" | "link";

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId?: string;
  projectId?: string;
}

export function QuickActionsModal({ isOpen, onClose, organizationId, projectId }: QuickActionsModalProps) {
  const [activeTab, setActiveTab] = useState<ActionTab>("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (files: FileList | null) => {
    if (files && files.length > 0) {
      console.log("Files selected:", files);
      // TODO: Handle file upload logic
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const tabs: { id: ActionTab; label: string; icon: React.ReactNode }[] = [
    { id: "upload", label: "Upload File", icon: <Upload className="h-4 w-4" /> },
    { id: "document", label: "Document", icon: <FileText className="h-4 w-4" /> },
    { id: "image", label: "Image", icon: <Image className="h-4 w-4" /> },
    { id: "link", label: "Link", icon: <LinkIcon className="h-4 w-4" /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-lg"
          >
            <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 className="text-lg font-semibold text-foreground">Quick Actions</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-border px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 -mb-px",
                      activeTab === tab.id
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab.icon}
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="p-6">
                {activeTab === "upload" && (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                      isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileSelect(e.target.files)}
                    />
                    <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-foreground mb-2">
                      Drag and drop files here, or click to browse
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Supports: PDF, DOC, DOCX, PNG, JPG, GIF
                    </p>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="mx-auto"
                    >
                      Select Files
                    </Button>
                  </div>
                )}

                {activeTab === "document" && (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-foreground mb-2">
                      Select a workspace document
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Browse your workspace documents to attach
                    </p>
                    <Button variant="outline" className="mx-auto">
                      Browse Documents
                    </Button>
                  </div>
                )}

                {activeTab === "image" && (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={cn(
                      "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                      isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    )}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => handleFileSelect(e.target.files)}
                    />
                    <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-sm text-foreground mb-2">
                      Drag and drop images here
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Supports: PNG, JPG, GIF, WebP
                    </p>
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      className="mx-auto"
                    >
                      Select Images
                    </Button>
                  </div>
                )}

                {activeTab === "link" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        URL
                      </label>
                      <input
                        type="url"
                        placeholder="https://example.com"
                        className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Title (optional)
                      </label>
                      <input
                        type="text"
                        placeholder="Link title"
                        className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground outline-none focus:ring-2 focus:ring-primary/50"
                      />
                    </div>
                    <Button className="w-full">
                      Add Link
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
