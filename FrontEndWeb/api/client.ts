import axios from "axios";
import SecureLS from "secure-ls";

const secureLs = typeof window !== "undefined" ? new SecureLS({ encodingType: "aes" }) : null;

export const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

client.interceptors.request.use(
  (config) => {
    const token = secureLs ? secureLs.get("userToken") : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== "undefined") {
        if (secureLs) secureLs.remove("userToken");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);
