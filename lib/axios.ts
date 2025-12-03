import axios, { isAxiosError } from "axios";
import { getAccessToken } from "./supabase/client";

const axiosInstance = axios.create({
  baseURL: typeof window !== 'undefined' ? '/api' : `${process.env.NEXT_PUBLIC_BASE_URL || ''}/api`,
  timeout: 30000, // Increased to 30 seconds for better reliability
  headers: { "Content-Type": "application/json" },
});

// Add interceptors for request and response
axiosInstance.interceptors.request.use(
  async (config) => {
    // Only attempt to get token in browser environment
    if (typeof window !== 'undefined') {
      try {
        const token = await getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.warn("Failed to get access token:", error);
        // Continue with request even if token retrieval fails
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally
    if (axios.isAxiosError(error)) { 
      if (error.response) {
        // Try to get a helpful message from various places
        const rawErrorMessage = error.response.data?.error || 
                                error.response.data?.message || 
                                error.response.statusText;
                                
        // 👇️ The actual fix: Provide a reliable message fallback
        const finalMessage = rawErrorMessage || `Unknown API Error (Status ${error.response.status})`;

        console.error("API Error:", {
          status: error.response.status,
          statusText: error.response.statusText,
          message: finalMessage,
          url: error.config?.url,
          method: error.config?.method,
          data: error.response.data
        });
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Network Error - No response received:", {
          message: error.message,
          url: error.config?.url,
          method: error.config?.method
        });
      } else {
        // Something happened in setting up the request
        console.error("Request Error (Config/Setup):", error.message);
      }
    } else {
      // Non-Axios error (e.g., from the interceptor itself)
      console.error("Interceptor/Unknown Error:", error);
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
export { isAxiosError };