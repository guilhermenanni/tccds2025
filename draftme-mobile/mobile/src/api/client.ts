import axios from 'axios';

// Ajusta aqui pro IP/porta do seu backend
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.67.127.206:3000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});
