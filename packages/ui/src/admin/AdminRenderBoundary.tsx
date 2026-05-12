"use client";

import type { ErrorInfo, ReactNode } from "react";
import { Component } from "react";

type AdminRenderBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
};

type AdminRenderBoundaryState = {
  hasError: boolean;
};

/**
 * WHY:   Admin pages should keep their surrounding UI visible even when one client-only widget fails at runtime.
 * WHAT:  Catches render-time client errors and swaps the failed subtree for a supplied fallback surface.
 * HOW:   Uses a classic React error boundary so chart-heavy sections cannot blank an entire admin route.
 */
export default class AdminRenderBoundary extends Component<
  AdminRenderBoundaryProps,
  AdminRenderBoundaryState
> {
  state: AdminRenderBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo) {
    // Intentionally rely on the dev overlay and console for diagnostics.
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
