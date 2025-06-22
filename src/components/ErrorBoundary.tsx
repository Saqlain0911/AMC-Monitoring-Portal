import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; retry: () => void }>;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const { fallback: FallbackComponent } = this.props;

      if (FallbackComponent && this.state.error) {
        return (
          <FallbackComponent
            error={this.state.error}
            retry={this.handleRetry}
          />
        );
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-3">
                  <div>
                    <strong>Something went wrong</strong>
                    <p className="text-sm mt-1">
                      An unexpected error occurred. Please try refreshing the
                      page.
                    </p>
                  </div>

                  {this.state.error && import.meta.env.DEV && (
                    <details className="text-xs">
                      <summary className="cursor-pointer">
                        Error details (Development)
                      </summary>
                      <pre className="mt-2 p-2 bg-red-100 rounded text-red-800 overflow-auto">
                        {this.state.error.toString()}
                        {this.state.errorInfo?.componentStack}
                      </pre>
                    </details>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={this.handleRetry}
                      size="sm"
                      variant="outline"
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Try Again
                    </Button>
                    <Button onClick={() => window.location.reload()} size="sm">
                      Refresh Page
                    </Button>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook version for functional components
export const useErrorHandler = () => {
  return React.useCallback((error: Error, errorInfo?: React.ErrorInfo) => {
    console.error("Error caught by useErrorHandler:", error, errorInfo);
    // You can extend this to send errors to a logging service
  }, []);
};

// Custom error boundary for specific components
export const ComponentErrorBoundary: React.FC<{
  componentName: string;
  children: React.ReactNode;
}> = ({ componentName, children }) => {
  return (
    <ErrorBoundary
      fallback={({ error, retry }) => (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <strong>Error in {componentName}</strong>
              <p className="text-sm">
                This component encountered an error and couldn't render
                properly.
              </p>
              <Button onClick={retry} size="sm" variant="outline">
                <RefreshCw className="w-4 h-4 mr-1" />
                Retry
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};
