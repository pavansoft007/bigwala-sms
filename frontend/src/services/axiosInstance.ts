import axios from "axios";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '',
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("authToken");

        // Ensure headers exist before modifying them
        config.headers = config.headers || {};

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            window.location.href = "/logout";
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;