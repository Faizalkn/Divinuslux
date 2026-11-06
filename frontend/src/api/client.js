import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api"
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem("expense-token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.startsWith("/auth/")) {
      localStorage.removeItem("expense-token");
      window.dispatchEvent(new Event("expense-session-expired"));
    }
    return Promise.reject(error);
  }
);

export function getErrorMessage(error) {
  return error.response?.data?.message || error.message || "Something went wrong. Please try again.";
}

export default client;
