"use client";

import React from 'react';
import { cn } from '@qentrah/platform-core/classnames';

export type LoadingStyle = 'skeleton' | 'spinner' | 'calendar' | 'board' | 'table' | 'dots';

export interface ViewLoadingProps {
  /** Loading style to display */
  style?: LoadingStyle;
  /** Custom message to display */
  message?: string;
  /** Custom className */
  className?: string;
  /** Height of the loading container */
  height?: string | number;
  /** Show overlay (default: true) */
  overlay?: boolean;
}

/**
 * ViewLoading - Custom loading component for all views.
 * 
 * Provides consistent loading states across the application:
 * - skeleton: Card-based skeleton for lists/tables
 * - spinner: Simple spinner for general loading
 * - calendar: Calendar-specific loading with grid layout
 * - board: Kanban board loading with column skeletons
 * - table: Table row skeletons
 * - dots: Animated dots for inline loading
 */
export function ViewLoading({
  style = 'skeleton',
  message,
  className,
  height = '400px',
  overlay = true,
}: ViewLoadingProps) {
  const content = (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        overlay && "absolute inset-0 bg-background/80 backdrop-blur-sm",
        className
      )}
      style={{ height: typeof height === 'number' ? `${height}px` : height }}
    >
      {style === 'skeleton' && <SkeletonLoader message={message} />}
      {style === 'spinner' && <SpinnerLoader message={message} />}
      {style === 'calendar' && <CalendarLoader message={message} />}
      {style === 'board' && <BoardLoader message={message} />}
      {style === 'table' && <TableLoader message={message} />}
      {style === 'dots' && <DotsLoader message={message} />}
    </div>
  );

  if (!overlay) {
    return content;
  }

  return (
    <div className="relative w-full" style={{ height: typeof height === 'number' ? `${height}px` : height }}>
      {content}
    </div>
  );
}

function SkeletonLoader({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
        <div className="w-8 h-8 bg-muted rounded-full animate-pulse delay-75" />
        <div className="w-8 h-8 bg-muted rounded-full animate-pulse delay-150" />
      </div>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

function SpinnerLoader({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 border-4 border-muted rounded-full" />
        <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

function CalendarLoader({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-4xl px-8">
      <div className="w-full grid grid-cols-7 gap-2">
        {/* Header */}
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={`header-${i}`} className="h-8 bg-muted/50 rounded animate-pulse" />
        ))}
        {/* Days */}
        {Array.from({ length: 35 }).map((_, i) => (
          <div key={`day-${i}`} className="h-20 bg-muted/30 rounded animate-pulse" />
        ))}
      </div>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

function BoardLoader({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-6xl px-4">
      <div className="w-full grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, colIndex) => (
          <div key={`col-${colIndex}`} className="flex flex-col gap-3">
            {/* Column header */}
            <div className="h-10 bg-muted/50 rounded-lg animate-pulse" />
            {/* Cards */}
            {Array.from({ length: 3 + (colIndex % 2) }).map((_, cardIndex) => (
              <div key={`card-${cardIndex}`} className="h-24 bg-muted/30 rounded-lg animate-pulse" />
            ))}
          </div>
        ))}
      </div>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

function TableLoader({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-4xl px-8">
      <div className="w-full flex flex-col gap-2">
        {/* Header */}
        <div className="flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={`header-${i}`} className="h-10 bg-muted/50 rounded flex-1 animate-pulse" />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: 8 }).map((_, rowIndex) => (
          <div key={`row-${rowIndex}`} className="flex gap-2">
            {Array.from({ length: 5 }).map((_, colIndex) => (
              <div key={`cell-${colIndex}`} className="h-12 bg-muted/30 rounded flex-1 animate-pulse" />
            ))}
          </div>
        ))}
      </div>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

function DotsLoader({ message }: { message?: string }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-2">
        <div className="w-3 h-3 bg-primary rounded-full animate-bounce" />
        <div className="w-3 h-3 bg-primary rounded-full animate-bounce delay-100" />
        <div className="w-3 h-3 bg-primary rounded-full animate-bounce delay-200" />
      </div>
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

/**
 * InlineLoading - Small inline loading indicator for buttons, forms, etc.
 */
export interface InlineLoadingProps {
  /** Size of the spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
}

export function InlineLoading({ size = 'md', className }: InlineLoadingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className={cn("relative", sizeClasses[size])}>
        <div className="absolute inset-0 border-2 border-muted rounded-full" />
        <div className="absolute inset-0 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}

/**
 * PageLoading - Full-page loading overlay for route transitions.
 */
export interface PageLoadingProps {
  /** Custom message */
  message?: string;
  /** Show logo (default: true) */
  showLogo?: boolean;
}

export function PageLoading({ message = "Loading...", showLogo = true }: PageLoadingProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background">
      {showLogo && (
        <div className="mb-8">
          <div className="w-16 h-16 bg-primary rounded-xl animate-pulse" />
        </div>
      )}
      <SpinnerLoader message={message} />
    </div>
  );
}
