// src/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://196.168.2.228:3000',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  } else {
    console.log("No token found");
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});


export default api;
