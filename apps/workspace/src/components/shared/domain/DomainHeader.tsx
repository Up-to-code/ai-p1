"use client";

import React from 'react';
import { cn } from '@qentrah/platform-core/classnames';
import { ChevronRight, MoreHorizontal, Plus, Settings } from 'lucide-react';
import { ViewSwitcherTabs, type ViewMode } from '../view-system/ViewSwitcher';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface HeaderAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  disabled?: boolean;
}

export interface DomainHeaderProps {
  /** Domain name (e.g., "Projects", "Clients", "Deals") */
  domain: string;
  /** Current section within the domain (e.g., "All Projects", "My Tasks") */
  currentSection: string;
  /** Breadcrumb items for navigation */
  breadcrumbs?: BreadcrumbItem[];
  /** Available view modes */
  availableViews?: ViewMode[];
  /** Currently active view mode */
  activeView?: ViewMode;
  /** Callback when view mode changes */
  onViewChange?: (view: ViewMode) => void;
  /** Header actions (buttons) */
  actions?: HeaderAction[];
  /** Show view switcher tabs (default: true) */
  showViewSwitcher?: boolean;
  /** Custom className */
  className?: string;
  /** Show settings button (default: false) */
  showSettings?: boolean;
  /** Settings button callback */
  onSettingsClick?: () => void;
}

/**
 * DomainHeader - Unified header component for all domain pages.
 * 
 * Provides consistent layout across the application:
 * - Breadcrumb navigation
 * - Domain title and current section
 * - View switcher tabs
 * - Action buttons
 * - Settings button
 * 
 * Used in Projects, Clients, Deals, Documents, and other domains.
 */
export function DomainHeader({
  domain,
  currentSection,
  breadcrumbs = [],
  availableViews = [],
  activeView,
  onViewChange,
  actions = [],
  showViewSwitcher = true,
  className,
  showSettings = false,
  onSettingsClick,
}: DomainHeaderProps) {
  return (
    <div className={cn("border-b border-border bg-background", className)}>
      {/* Top bar with breadcrumbs and actions */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side: breadcrumbs and title */}
          <div className="flex items-center gap-4">
            {/* Breadcrumbs */}
            {breadcrumbs.length > 0 && (
              <nav className="flex items-center gap-2 text-sm">
                {breadcrumbs.map((item, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                    {item.href ? (
                      <a
                        href={item.href}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <button
                        onClick={item.onClick}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item.label}
                      </button>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            )}

            {/* Domain title */}
            <div>
              <h1 className="text-2xl font-bold text-foreground">{domain}</h1>
              <p className="text-sm text-muted-foreground">{currentSection}</p>
            </div>
          </div>

          {/* Right side: actions */}
          <div className="flex items-center gap-2">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                disabled={action.disabled}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  action.variant === 'primary'
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : action.variant === 'secondary'
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {action.icon}
                {action.label}
              </button>
            ))}

            {showSettings && (
              <button
                onClick={onSettingsClick}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* View switcher tabs */}
      {showViewSwitcher && availableViews.length > 0 && activeView && onViewChange && (
        <div className="px-6">
          <ViewSwitcherTabs
            availableViews={availableViews}
            activeView={activeView}
            onViewChange={onViewChange}
          />
        </div>
      )}
    </div>
  );
}

/**
 * DomainHeaderCompact - Compact header variant for sub-pages.
 * Shows only the current section and minimal actions.
 */
export interface DomainHeaderCompactProps {
  /** Current section title */
  title: string;
  /** Back button callback */
  onBack?: () => void;
  /** Header actions */
  actions?: HeaderAction[];
  /** Custom className */
  className?: string;
}

export function DomainHeaderCompact({
  title,
  onBack,
  actions = [],
  className,
}: DomainHeaderCompactProps) {
  return (
    <div className={cn("border-b border-border bg-background px-6 py-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-muted transition-colors"
              title="Back"
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground rotate-180" />
            </button>
          )}
          <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        </div>

        <div className="flex items-center gap-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              disabled={action.disabled}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                action.variant === 'primary'
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : action.variant === 'secondary'
                  ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * DomainSectionHeader - Header for sections within a domain.
 * Shows section title with optional description and actions.
 */
export interface DomainSectionHeaderProps {
  /** Section title */
  title: string;
  /** Section description */
  description?: string;
  /** Section actions */
  actions?: HeaderAction[];
  /** Show border (default: true) */
  showBorder?: boolean;
  /** Custom className */
  className?: string;
}

export function DomainSectionHeader({
  title,
  description,
  actions = [],
  showBorder = true,
  className,
}: DomainSectionHeaderProps) {
  return (
    <div
      className={cn(
        "px-6 py-4",
        showBorder && "border-b border-border",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>

        {actions.length > 0 && (
          <div className="flex items-center gap-2 ml-4">
            {actions.map((action, index) => (
              <button
                key={index}
                onClick={action.onClick}
                disabled={action.disabled}
                className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  action.variant === 'primary'
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : action.variant === 'secondary'
                    ? "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
