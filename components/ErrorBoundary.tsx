
import { Component, ErrorInfo, ReactNode } from 'react';
import { Mascot } from './Mascot';
import { RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  // Explicitly declare props to satisfy TypeScript in environments where base class inference fails
  declare props: Readonly<ErrorBoundaryProps>;

  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#FDFBF7] p-8 text-center">
          <div className="w-48 h-48 mb-8 relative animate-float">
            <Mascot expression="confused" />
          </div>
          <h1 className="font-display font-bold text-4xl text-brand-navy mb-4">
            The wind changed direction.
          </h1>
          <p className="text-brand-navy/60 max-w-md mb-8">
            Something went wrong behind the scenes. We've logged this error and are looking into it.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-brand-navy text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-teal transition-all flex items-center gap-2 shadow-lg hover:shadow-xl active:scale-95"
          >
            <RefreshCw size={20} />
            Reload Application
          </button>
          <pre className="mt-12 p-4 bg-brand-navy/5 rounded-lg text-xs font-mono text-brand-navy/30 max-w-lg overflow-hidden text-left">
            Error: {this.state.error?.message}
          </pre>
        </div>
      );
    }

    return this.props.children;
  }
}
