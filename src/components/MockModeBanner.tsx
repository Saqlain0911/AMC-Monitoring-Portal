import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { MOCK_MODE } from "@/config/mockMode";

const MockModeBanner: React.FC = () => {
  if (!MOCK_MODE) return null;

  return (
    <Alert className="border-amber-200 bg-amber-50 text-amber-800 mb-4">
      <Info className="h-4 w-4" />
      <AlertDescription>
        <strong>Demo Mode:</strong> This application is running in demo mode
        with mock data. All data is stored locally and will be reset when you
        clear browser storage.
      </AlertDescription>
    </Alert>
  );
};

export default MockModeBanner;
