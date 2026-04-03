import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL ?? "",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.response.use(
  res => res,
  err => {
    // if (err.response?.status === 401) {
    //   window.location.href = "/login";
    // }
    return Promise.reject(err);
  }
);
