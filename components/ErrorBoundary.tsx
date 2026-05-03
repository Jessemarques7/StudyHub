"use client";

import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "var(--color-text-secondary)",
            }}
          >
            Something went wrong. Please refresh.
          </div>
        )
      );
    }

    return this.props.children;
  }
}
