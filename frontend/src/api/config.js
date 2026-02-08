// API Configuration - automatically switches between local and production

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5004';

export default API_URL;
