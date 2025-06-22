import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const BackendTest: React.FC = () => {
  const [testResult, setTestResult] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const testBackend = async () => {
    setIsLoading(true);
    setTestResult("Testing...");

    try {
      // Test health endpoint
      const healthResponse = await fetch("http://localhost:3002/health");
      const healthData = await healthResponse.json();

      // Test API endpoint
      const apiResponse = await fetch("http://localhost:3002/api");
      const apiData = await apiResponse.json();

      setTestResult(`
✅ Backend is working!
Health Status: ${healthData.status}
Database: ${healthData.database?.connected ? "Connected" : "Disconnected"}
API Version: ${apiData.version}
Available Endpoints: ${Object.keys(apiData.endpoints).length}
      `);
    } catch (error) {
      setTestResult(`❌ Backend connection failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto mt-4">
      <CardHeader>
        <CardTitle>Backend Connection Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testBackend} disabled={isLoading} className="w-full">
          {isLoading ? "Testing..." : "Test Backend Connection"}
        </Button>

        {testResult && (
          <pre className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap">
            {testResult}
          </pre>
        )}
      </CardContent>
    </Card>
  );
};

export default BackendTest;

