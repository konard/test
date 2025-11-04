import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const initData = localStorage.getItem('tg_init_data');
  if (initData) {
    config.headers.Authorization = `tma ${initData}`;
  }
  return config;
});

// Types
export interface User {
  id: string;
  telegramId: string;
  username?: string;
  firstName: string;
  lang: string;
}

export interface Animal {
  id: string;
  type: 'chicken' | 'pig' | 'cow';
  name?: string;
  userId: string;
  purchaseDate: string;
  slaughterDate?: string;
  status: 'growing' | 'ready' | 'slaughtered';
  media?: Media[];
  progress?: number;
  marketInfo?: AnimalMarketInfo;
}

export interface Media {
  id: string;
  animalId: string;
  url: string;
  type: 'photo' | 'video';
  createdAt: string;
}

export interface AnimalMarketInfo {
  type: string;
  price: number;
  maintenanceCost: number;
  growthPeriodMonths: number;
  description: string;
  expectedYield: string;
}

export interface Payment {
  id: string;
  userId: string;
  animalId?: string;
  type: 'purchase' | 'maintenance';
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
}

// Auth API
export const authAPI = {
  login: async (initData: string) => {
    const response = await api.post('/auth/telegram', { initData });
    return response.data;
  },
};

// Animals API
export const animalsAPI = {
  getMarket: async () => {
    const response = await api.get('/animals/market');
    return response.data;
  },

  getMyAnimals: async () => {
    const response = await api.get('/animals/my');
    return response.data;
  },

  getAnimalById: async (id: string) => {
    const response = await api.get(`/animals/${id}`);
    return response.data;
  },
};

// Payments API
export const paymentsAPI = {
  createPayment: async (data: {
    animalType: string;
    type: 'purchase' | 'maintenance';
    currency?: string;
  }) => {
    const response = await api.post('/payments/create', data);
    return response.data;
  },

  getMyPayments: async () => {
    const response = await api.get('/payments/my');
    return response.data;
  },
};

export default api;
