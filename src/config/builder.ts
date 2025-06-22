// Builder.io configuration
export const builderConfig = {
  // Get API key from environment variables
  // Vite projects prefer VITE_ prefix, but supporting both for compatibility
  apiKey: (() => {
    try {
      return (
        import.meta.env?.VITE_BUILDER_API_KEY ||
        import.meta.env?.REACT_APP_BUILDER_API_KEY ||
        (typeof process !== "undefined"
          ? process.env?.REACT_APP_BUILDER_API_KEY
          : undefined) ||
        "202a5f41621b40dd83935e0aee1b6613" // Fallback to provided API key
      );
    } catch (error) {
      console.warn(
        "Could not access environment variables for Builder.io API key, using fallback",
      );
      return "202a5f41621b40dd83935e0aee1b6613"; // Fallback to provided API key
    }
  })(),

  // Default Builder.io settings
  canTrack: true,
  includeRefs: true,

  // Environment check
  isDevelopment: (() => {
    try {
      return import.meta.env?.DEV ?? true;
    } catch {
      return true;
    }
  })(),
  isProduction: (() => {
    try {
      return import.meta.env?.PROD ?? false;
    } catch {
      return false;
    }
  })(),
};

// Validation helper
export const validateBuilderConfig = () => {
  if (!builderConfig.apiKey || builderConfig.apiKey === "your_key_here") {
    console.warn(
      "⚠️ Builder.io API key not configured. Please add a valid VITE_BUILDER_API_KEY or REACT_APP_BUILDER_API_KEY to your .env file.",
    );
    return false;
  }

  console.log("✅ Builder.io configuration loaded successfully");
  return true;
};

// Initialize Builder.io (to be called once in app startup)
export const initBuilder = () => {
  const isValid = validateBuilderConfig();

  if (isValid) {
    console.log(
      "🏗️ Builder.io initialized with API key:",
      builderConfig.apiKey.substring(0, 8) + "...",
    );
  }

  return isValid;
};

export default builderConfig;
