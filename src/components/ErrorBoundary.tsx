import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('MolParetoLab error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      return (
        <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 font-sans text-[#e0e0e8]">
          <div className="max-w-md w-full bg-[#1A1918] border border-white/10 rounded-lg p-6 text-center">
            <h1 className="text-lg font-semibold text-white mb-2">Something went wrong</h1>
            <p className="text-sm text-[#9C9893] mb-4 font-mono break-all">
              {this.state.error.message}
            </p>
            <p className="text-xs text-[#9C9893]/80 mb-6">
              If this happens after clicking &quot;Analyze Molecules&quot;, RDKit may have failed to load. Check your connection and try refreshing.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#5F7367] text-white text-sm font-medium rounded-md hover:bg-[#798F81] transition-colors"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
