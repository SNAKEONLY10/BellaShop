// API Configuration - automatically switches between local and production

const API_URL = import.meta.env.VITE_API_URL || 'https://bellashop-backend.onrender.com';

export default API_URL;
