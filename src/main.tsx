import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Initialize Builder.io SDK
import { builder } from "@builder.io/react";
import { builderConfig } from "@/config/builder";
import { mockDataService } from "@/services/mockDataService";

// Initialize storage system first
mockDataService.initializeStorage();

// Initialize Builder.io with API key (only if valid)
if (builderConfig.apiKey && builderConfig.apiKey !== "your_key_here") {
  try {
    // Initialize Builder.io SDK with the API key
    builder.init(builderConfig.apiKey);
    
    // Function to initialize components
    const initializeComponents = () => {
      // Use type assertion to access the builder instance
      const builderInstance = builder as any;
      
      if (builderInstance.registerComponent) {
        // Now that builder is ready, import and register components
        import('@/lib/builderComponents').then(({ registerAMCComponents }) => {
          try {
            registerAMCComponents();
            console.log("✅ Builder.io components registered successfully");
          } catch (error) {
            console.error("❌ Failed to register components:", error);
          }
        }).catch(error => {
          console.error("❌ Failed to load builder components:", error);
        });
      } else {
        // If builder isn't ready yet, try again shortly
        setTimeout(initializeComponents, 100);
      }
    };
    
    // Start the initialization process
    initializeComponents();

    console.log("🏗️ Builder.io initialized with API key:", 
      builderConfig.apiKey.substring(0, 8) + "...");
  } catch (error) {
    console.error("❌ Failed to initialize Builder.io SDK:", error);
  }
} else {
  console.warn(
    "⚠️ Builder.io API key not configured or invalid. Add VITE_BUILDER_API_KEY to your .env file for Builder.io functionality.",
  );
  console.warn(
    "Current API key value:",
    builderConfig.apiKey
      ? builderConfig.apiKey.substring(0, 8) + "..."
      : "undefined",
  );
}

createRoot(document.getElementById("root")!).render(<App />);
