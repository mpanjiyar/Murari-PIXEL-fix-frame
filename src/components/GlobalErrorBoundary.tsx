import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logClientError } from '../services/clientErrorLogger';
import { AlertOctagon, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  loggedNotificationId?: string;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });

    // Automatically log uncaught React rendering crashes to Firestore 'admin_notifications'
    logClientError(error, {
      componentStack: errorInfo.componentStack || undefined,
      customTitle: `React Crash in Component Tree: ${error.name || 'ComponentException'}`,
      severity: 'CRITICAL',
      type: 'CLIENT_RUNTIME_ERROR',
    }).then(notif => {
      if (notif) {
        this.setState({ loggedNotificationId: notif.id });
      }
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#090a10] text-white flex items-center justify-center p-4 font-sans select-none">
          <div className="max-w-md w-full bg-zinc-900 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-[#FF5500] to-amber-500" />

            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mx-auto shadow-inner">
              <AlertOctagon size={32} />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                Something Went Wrong
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                An unexpected technical exception occurred. This incident has been automatically logged in real time to the system administrator dashboard.
              </p>
              {this.state.loggedNotificationId && (
                <div className="pt-1">
                  <span className="text-[10px] font-mono uppercase tracking-widest px-2.5 py-1 rounded bg-black/60 border border-white/10 text-amber-400">
                    Incident ID: {this.state.loggedNotificationId}
                  </span>
                </div>
              )}
            </div>

            {/* Error Preview */}
            {this.state.error && (
              <div className="p-3 rounded-xl bg-black/60 border border-white/5 text-left font-mono text-[11px] text-zinc-300 max-h-28 overflow-y-auto break-all">
                <span className="text-red-400 font-bold">{this.state.error.name}: </span>
                <span>{this.state.error.message}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase bg-[#FF5500] hover:bg-orange-500 text-white flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#FF5500]/25 transition-transform active:scale-95"
              >
                <RefreshCw size={14} />
                <span>Reload Page</span>
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="py-3 px-4 rounded-xl font-mono text-xs font-bold uppercase bg-white/10 hover:bg-white/15 text-zinc-300 flex items-center justify-center gap-2 border border-white/10 cursor-pointer transition-colors"
              >
                <Home size={14} />
                <span>Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
export default GlobalErrorBoundary;
