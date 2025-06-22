import React, { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Server,
  Database,
  Activity,
} from "lucide-react";
import { api, healthCheck } from "@/services/api";

interface BackendHealthData {
  status: string;
  message: string;
  timestamp: string;
  port: number;
  database: {
    connected: boolean;
    stats?: Record<string, number>;
  };
}

interface BackendStatusProps {
  className?: string;
}

const BackendStatus: React.FC<BackendStatusProps> = ({ className }) => {
  const [isOnline, setIsOnline] = useState(false);
  const [isChecking, setIsChecking] = useState(false);
  const [healthData, setHealthData] = useState<BackendHealthData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastChecked, setLastChecked] = useState<string | null>(null);

  const checkBackendStatus = async () => {
    setIsChecking(true);
    setError(null);

    try {
      // Try to reach the health endpoint with timeout using AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      try {
        const response = await fetch("http://localhost:3002/health", {
          method: "GET",
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const data = await response.json();
          setHealthData(data);
          setIsOnline(true);
          setLastChecked(new Date().toLocaleTimeString());
        } else {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } finally {
        clearTimeout(timeoutId);
      }
    } catch (err) {
      setIsOnline(false);
      setHealthData(null);

      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError("Request timeout - Backend may be slow or unreachable");
        } else if (err.message.includes("fetch")) {
          setError("Network error - Backend server may not be running");
        } else {
          setError(err.message);
        }
      } else {
        setError("Unknown error occurred while checking backend");
      }
      setLastChecked(new Date().toLocaleTimeString());
    } finally {
      setIsChecking(false);
    }
  };

  // Check database status
  const checkDatabaseStatus = async () => {
    if (!isOnline) return;

    try {
      const dbResponse = await api.get("/database/status");
      console.log("Database status:", dbResponse);
    } catch (err) {
      console.warn("Database check failed:", err);
    }
  };

  // Test basic API endpoints
  const testAPIEndpoints = async () => {
    if (!isOnline) return;

    const endpoints = ["/", "/test/database"];

    for (const endpoint of endpoints) {
      try {
        const response = await api.get(endpoint);
        console.log(`✅ API endpoint ${endpoint} working:`, response);
      } catch (err) {
        console.warn(`❌ API endpoint ${endpoint} failed:`, err);
      }
    }
  };

  useEffect(() => {
    // Initial check
    checkBackendStatus();

    // Check database and endpoints after backend check
    if (isOnline) {
      checkDatabaseStatus();
      testAPIEndpoints();
    }

    // Set up periodic checks every 30 seconds
    const interval = setInterval(checkBackendStatus, 30000);

    return () => clearInterval(interval);
  }, [isOnline]);

  const getStatusIcon = () => {
    if (isChecking) {
      return <RefreshCw className="h-4 w-4 animate-spin" />;
    }

    if (isOnline) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    } else {
      return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = () => {
    if (isOnline) return "text-green-600";
    return "text-red-600";
  };

  const getStatusBadge = () => {
    if (isChecking) {
      return <Badge variant="outline">Checking...</Badge>;
    }

    if (isOnline) {
      return (
        <Badge className="bg-green-100 text-green-800 border-green-200">
          Online
        </Badge>
      );
    } else {
      return <Badge variant="destructive">Offline</Badge>;
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Server className="h-5 w-5" />
          Backend Server Status
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Current Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className={`font-medium ${getStatusColor()}`}>
              {isOnline ? "Connected" : "Disconnected"}
            </span>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={checkBackendStatus}
            disabled={isChecking}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isChecking ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        {/* Last Checked */}
        {lastChecked && (
          <div className="text-sm text-muted-foreground">
            Last checked: {lastChecked}
          </div>
        )}

        {/* Health Data */}
        {healthData && isOnline && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Server:</span>
                <div className="font-medium">Port {healthData.port}</div>
              </div>
              <div>
                <span className="text-muted-foreground">Status:</span>
                <div className="font-medium">{healthData.status}</div>
              </div>
            </div>

            {/* Database Status */}
            <div className="flex items-center gap-2 pt-2 border-t">
              <Database className="h-4 w-4" />
              <span className="text-sm">Database:</span>
              <Badge
                variant={
                  healthData.database.connected ? "default" : "destructive"
                }
                className="text-xs"
              >
                {healthData.database.connected ? "Connected" : "Disconnected"}
              </Badge>
            </div>

            {/* Database Stats */}
            {healthData.database.stats && (
              <div className="bg-gray-50 rounded-md p-3">
                <div className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Database Tables:
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  {Object.entries(healthData.database.stats).map(
                    ([table, count]) => (
                      <div key={table} className="flex justify-between">
                        <span className="capitalize">{table}:</span>
                        <span className="font-medium">{count}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error Display */}
        {error && !isOnline && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Backend Connection Failed:</strong>
              <br />
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Backend Setup Instructions */}
        {!isOnline && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>To start the backend server:</strong>
              <br />
              1. Open a terminal in the backend directory
              <br />
              2. Run:{" "}
              <code className="bg-gray-100 px-1 rounded">npm run dev</code>
              <br />
              3. The server should start on port 3000
            </AlertDescription>
          </Alert>
        )}

        {/* Mock Mode Notice */}
        {!isOnline && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <div className="text-sm text-blue-800">
              <strong>ℹ️ Currently running in Mock Mode</strong>
              <br />
              The application is using local mock data while the backend is
              offline. All changes are stored locally in your browser.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BackendStatus;
