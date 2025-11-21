import axios from 'axios';
import { PickupRequest, User, UserRole, Language } from '../types';

// Default to localhost:5000, but allows env var override
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds timeout
});

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper to map backend snake_case to frontend camelCase
const mapPickup = (p: any): PickupRequest => ({
  id: p.id,
  status: p.status,
  scheduledAt: p.scheduled_at,
  items: p.items,
  location: p.location,
  notes: p.notes
});

export const auth = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  register: async (name: string, email: string, password: string, role: string, language: string) => {
    const res = await api.post('/auth/register', { name, email, password, role, language });
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
    }
    return res.data;
  },
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};

export const pickups = {
  create: async (data: Partial<PickupRequest>) => {
    const res = await api.post('/pickups', data);
    return mapPickup(res.data);
  },
  list: async (): Promise<PickupRequest[]> => {
    const res = await api.get('/pickups');
    return res.data.map(mapPickup);
  }
};

export const aiChat = {
  sendMessage: async (history: any[], message: string, language: string) => {
    const res = await api.post('/chat', { history, message, language });
    return res.data.text;
  }
};

export default api;
