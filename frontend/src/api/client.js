import axios from 'axios';
import API_URL from './config.js';

// Create axios instance with base URL
const apiClient = axios.create({
  baseURL: API_URL,
});

export default apiClient;
