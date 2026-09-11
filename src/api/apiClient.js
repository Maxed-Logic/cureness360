import axios from "axios";
import toast from "react-hot-toast";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  maxBodyLength: Infinity,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor to add token
apiClient.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Show toast message
      toast.error("Session expired !");

      // Clear local storage
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("isLoggedIn");
      sessionStorage.removeItem('noticeSeen');
      sessionStorage.removeItem('kycModalClosed');

      // Redirect to login page after a short delay (optional)
      setTimeout(() => {
        window.location.href = "/login";
      },);
    }
    return Promise.reject(error);
  }
);

export default apiClient;