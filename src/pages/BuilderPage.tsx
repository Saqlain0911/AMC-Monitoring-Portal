import React from "react";
import { BuilderComponent } from "@builder.io/react";
import { useAuth } from "@/context/AuthContext";
import { builderConfig } from "@/config/builder";

interface BuilderPageProps {
  model?: string;
  contentId?: string;
  urlPath?: string;
}

const BuilderPage: React.FC<BuilderPageProps> = ({
  model = "page",
  contentId,
  urlPath = "/builder",
}) => {
  const { user } = useAuth();

  // Pass user attributes for personalization
  const userAttributes = {
    userId: user?.id,
    userName: user?.name,
    userRole: user?.role,
    userEmail: user?.email,
    userDepartment: user?.department,
    urlPath,
  };

  // Check if Builder.io is properly configured
  const isBuilderConfigured =
    builderConfig.apiKey && builderConfig.apiKey !== "your_key_here";

  return (
    <div className="min-h-full">
      {/* Builder.io Content with user context - only render if properly configured */}
      {isBuilderConfigured && (
        <div className="builder-content">
          <BuilderComponent
            model={model}
            content={contentId}
            data={userAttributes}
            options={{
              includeRefs: builderConfig.includeRefs,
              noTrack: !builderConfig.canTrack,
            }}
          />
        </div>
      )}

      {/* Fallback content when Builder.io content is not available */}
      <div className="container mx-auto px-6 py-8 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            Builder.io Content Page
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            This page displays content from Builder.io. Create content in your
            Builder.io dashboard to see it here.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="text-xl font-semibold text-blue-900 mb-3">
              👤 User Context Available
            </h2>
            <div className="text-sm text-blue-800 space-y-2">
              <p>
                <strong>User ID:</strong> {user?.id || "Not available"}
              </p>
              <p>
                <strong>Name:</strong> {user?.name || "Not available"}
              </p>
              <p>
                <strong>Role:</strong> {user?.role || "Not available"}
              </p>
              <p>
                <strong>Email:</strong> {user?.email || "Not available"}
              </p>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              🎯 Personalization Features
            </h3>
            <div className="text-sm text-green-800 space-y-2 text-left">
              <p>
                • <strong>User-specific content:</strong> Show different content
                based on user role
              </p>
              <p>
                • <strong>Dynamic greetings:</strong> Use user name for
                personalized messages
              </p>
              <p>
                • <strong>Role-based features:</strong> Display admin/user
                specific sections
              </p>
              <p>
                • <strong>Department targeting:</strong> Show relevant content
                by department
              </p>
              <p>
                • <strong>Analytics tracking:</strong> Track user interactions
                with content
              </p>
            </div>
          </div>

          {builderConfig.isDevelopment && (
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Development Mode:</strong> User attributes are passed to
                Builder.io for personalization. Check the Builder.io preview to
                test different user scenarios.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuilderPage;
