import React from "react";
import { BuilderComponent, builder } from "@builder.io/react";
import { builderConfig } from "@/config/builder";

// Register custom components if needed (optional)
// builder.registerComponent(YourCustomComponent, {
//   name: 'YourCustomComponent',
//   inputs: [
//     { name: 'title', type: 'string' },
//     { name: 'description', type: 'longText' }
//   ]
// });

interface BuilderHomeProps {
  // Optional props for Builder.io content
  userAttributes?: Record<string, any>;
  urlPath?: string;
}

const BuilderHome: React.FC<BuilderHomeProps> = ({
  userAttributes = {},
  urlPath = "/home",
}) => {
  // You can pass user attributes for personalization
  const attributes = {
    ...userAttributes,
    // Add any default attributes here
    urlPath,
  };

  // Check if Builder.io is properly configured
  const isBuilderConfigured =
    builderConfig.apiKey && builderConfig.apiKey !== "your_key_here";

  return (
    <div className="min-h-screen bg-white">
      {/* Builder.io Content - only render if properly configured */}
      {isBuilderConfigured && (
        <div className="builder-content">
          <BuilderComponent
            model="page"
            content={undefined} // Let Builder.io fetch content based on URL
            data={attributes}
            options={{
              includeRefs: builderConfig.includeRefs,
              noTrack: !builderConfig.canTrack,
            }}
          />
        </div>
      )}

      {/* Fallback content when Builder.io content is not available */}
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome to AMC Portal
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            This page is powered by Builder.io. To see custom content, create a
            "page" model in your Builder.io dashboard with the URL path "/home".
          </p>

          {!isBuilderConfigured && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-red-900 mb-3">
                ⚠️ Builder.io Not Configured
              </h2>
              <p className="text-sm text-red-800 mb-4">
                The Builder.io API key is not configured. Please update your
                .env file with a valid API key to enable Builder.io content.
              </p>
              <div className="bg-red-100 rounded p-3">
                <code className="text-xs text-red-700">
                  VITE_BUILDER_API_KEY=your_actual_api_key_here
                </code>
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-3">
              📝 Setup Instructions
            </h2>
            <div className="text-sm text-blue-800 space-y-2 text-left">
              <p>
                <strong>1. Login to Builder.io:</strong> Access your Builder.io
                dashboard
              </p>
              <p>
                <strong>2. Create a Page:</strong> Add a new page model named
                "home"
              </p>
              <p>
                <strong>3. Set URL:</strong> Configure the page URL to "/home"
              </p>
              <p>
                <strong>4. Design:</strong> Use the visual editor to create your
                content
              </p>
              <p>
                <strong>5. Publish:</strong> Publish the page to see it live
                here
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                🏗️ Builder.io Features
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Visual drag-and-drop editor</li>
                <li>• Real-time preview</li>
                <li>• A/B testing capabilities</li>
                <li>• Content scheduling</li>
                <li>• Analytics integration</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                🎯 Content Types
              </h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Landing pages</li>
                <li>• Product showcases</li>
                <li>• Marketing content</li>
                <li>• Blog sections</li>
                <li>• Interactive components</li>
              </ul>
            </div>
          </div>

          {builderConfig.isDevelopment && (
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Development Mode:</strong> Builder.io content will be
                fetched from your dashboard. Make sure your API key is
                configured correctly in the .env file.
              </p>
              <p className="text-xs text-yellow-600 mt-2">
                API Key:{" "}
                {builderConfig.apiKey
                  ? `${builderConfig.apiKey.substring(0, 8)}...`
                  : "Not configured"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuilderHome;
