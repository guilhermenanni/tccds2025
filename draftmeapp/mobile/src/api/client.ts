import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});
