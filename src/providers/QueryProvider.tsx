import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

// Configure the query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: how long data is considered fresh
      staleTime: 1 * 60 * 1000, // 1 minute
      // Cache time: how long inactive data stays in cache
      gcTime: 5 * 60 * 1000, // 5 minutes (formerly cacheTime)
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on certain error types
        if (
          error?.status === 401 ||
          error?.status === 403 ||
          error?.status === 404
        ) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      // Refetch on window focus only in production
      refetchOnWindowFocus: import.meta.env.PROD,
      // Refetch on reconnect
      refetchOnReconnect: true,
      // Don't refetch on mount if data exists and is fresh
      refetchOnMount: "always",
    },
    mutations: {
      // Retry mutations once on failure
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// Error boundary for query errors
interface QueryErrorBoundaryProps {
  children: React.ReactNode;
}

class QueryErrorBoundary extends React.Component<
  QueryErrorBoundaryProps,
  { hasError: boolean; error: Error | null }
> {
  constructor(props: QueryErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Query error boundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md mx-auto text-center">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <div className="text-red-500 mb-4">
                <svg
                  className="w-16 h-16 mx-auto"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-gray-900 mb-2">
                Something went wrong
              </h1>
              <p className="text-gray-600 mb-4">
                An error occurred while loading the application. Please try
                refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Refresh Page
              </button>
              {import.meta.env.DEV && this.state.error && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Global error handler for unhandled query errors
const handleGlobalQueryError = (error: Error) => {
  console.error("Unhandled query error:", error);

  // You can add global error reporting here
  // For example, send errors to an error tracking service like Sentry
  if (import.meta.env.PROD) {
    // Example: Sentry.captureException(error);
  }
};

// Custom hook for handling query errors
export const useQueryErrorHandler = () => {
  React.useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event.type === "error") {
        handleGlobalQueryError(event.error as Error);
      }
    });

    return unsubscribe;
  }, []);
};

// Main provider component
interface QueryProviderProps {
  children: React.ReactNode;
}

export const QueryProvider: React.FC<QueryProviderProps> = ({ children }) => {
  return (
    <QueryErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {children}
        {/* React Query Devtools - only in development */}
        {import.meta.env.DEV && (
          <ReactQueryDevtools
            initialIsOpen={false}
            position="bottom-right"
            buttonPosition="bottom-right"
          />
        )}
      </QueryClientProvider>
    </QueryErrorBoundary>
  );
};

// Export the query client for manual usage
export { queryClient };

// Utility functions for query management
export const queryUtils = {
  // Clear all caches
  clearCache: () => {
    queryClient.clear();
  },

  // Invalidate specific query patterns
  invalidatePattern: (pattern: string[]) => {
    queryClient.invalidateQueries({ queryKey: pattern });
  },

  // Remove specific queries from cache
  removeQueries: (pattern: string[]) => {
    queryClient.removeQueries({ queryKey: pattern });
  },

  // Prefetch data
  prefetch: async (queryKey: string[], queryFn: () => Promise<any>) => {
    await queryClient.prefetchQuery({ queryKey, queryFn });
  },

  // Set query data manually
  setQueryData: (queryKey: string[], data: any) => {
    queryClient.setQueryData(queryKey, data);
  },

  // Get cached query data
  getQueryData: (queryKey: string[]) => {
    return queryClient.getQueryData(queryKey);
  },
};

// Hook for offline/online status
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  React.useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Refetch queries when coming back online
      queryClient.refetchQueries({
        type: "active",
        stale: true,
      });
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return isOnline;
};

// Hook for query state monitoring
export const useQueryState = () => {
  const [state, setState] = React.useState({
    isFetching: false,
    isMutating: false,
    isError: false,
    errorCount: 0,
  });

  React.useEffect(() => {
    const unsubscribeQuery = queryClient.getQueryCache().subscribe((event) => {
      setState((prev) => ({
        ...prev,
        isFetching: queryClient.isFetching() > 0,
        isError: event.type === "error",
        errorCount:
          event.type === "error" ? prev.errorCount + 1 : prev.errorCount,
      }));
    });

    const unsubscribeMutation = queryClient.getMutationCache().subscribe(() => {
      setState((prev) => ({
        ...prev,
        isMutating: queryClient.isMutating() > 0,
      }));
    });

    return () => {
      unsubscribeQuery();
      unsubscribeMutation();
    };
  }, []);

  return state;
};
