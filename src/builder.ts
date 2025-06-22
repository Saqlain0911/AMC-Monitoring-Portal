// Use Vite's import.meta.env for environment variables
const apiKey =
  import.meta.env.VITE_BUILDER_API_KEY ||
  import.meta.env.REACT_APP_BUILDER_API_KEY ||
  "";

const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3002";

export { apiKey };
export default apiUrl;


