import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This will include credentials in requests
});

export const registerUser = async (userData) => {
  return await axiosInstance.post(`/api/auth/register`, userData);
};

export const loginUser = async (userData) => {
  return await axiosInstance.post(`/api/auth/login`, userData);
};


export const axiosInstanceLoggedIn = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

axiosInstanceLoggedIn.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


export const getCurrentUser = async () => {
  return await axiosInstanceLoggedIn.get(`/api/auth/me`);
};


export const createEvent = async (formData) => {
  return await axiosInstanceLoggedIn.post(`/api/events/create`, formData);
};

