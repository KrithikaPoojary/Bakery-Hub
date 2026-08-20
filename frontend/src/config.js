// Configures API base URL and asset paths dynamically
// In production on Vercel, requests use relative path "" (/api) or REACT_APP_API_URL
// In local development, defaults to http://localhost:5000

export const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production" ? "/api" : "http://localhost:5000/api");

export const SERVER_URL =
  process.env.REACT_APP_SERVER_URL ||
  (process.env.NODE_ENV === "production" ? "" : "http://localhost:5000");

export const getAssetUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SERVER_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};
