// User types
export interface User {
  id: string;
  telegramId: string;
  username?: string;
  firstName: string;
  phone?: string;
  address?: string;
  lang: string;
}

// Animal types
export type AnimalType = 'cow' | 'pig' | 'chicken';
export type AnimalStatus = 'growing' | 'ready' | 'slaughtered';

export interface Animal {
  id: string;
  type: AnimalType;
  name?: string;
  userId: string;
  purchaseDate: Date;
  slaughterDate?: Date;
  status: AnimalStatus;
}

// Payment types
export type PaymentType = 'purchase' | 'maintenance';
export type PaymentStatus = 'pending' | 'success' | 'failed';

export interface Payment {
  id: string;
  userId: string;
  animalId?: string;
  type: PaymentType;
  amount: number;
  currency: string;
  status: PaymentStatus;
  externalId?: string;
  createdAt: Date;
}

// Media types
export type MediaType = 'photo' | 'video';

export interface Media {
  id: string;
  animalId: string;
  url: string;
  type: MediaType;
  createdAt: Date;
}

// Animal market info
export interface AnimalMarketInfo {
  type: AnimalType;
  price: number;
  maintenanceCost: number;
  growthPeriodMonths: number;
  description: string;
  expectedYield: string;
}

// API request/response types
export interface TelegramInitData {
  user_id: string;
  username?: string;
  first_name: string;
  auth_date: number;
  hash: string;
}

export interface AuthRequest {
  initData: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface CreatePaymentRequest {
  animalId?: string;
  type: PaymentType;
  amount: number;
  currency: string;
}

export interface CreatePaymentResponse {
  paymentId: string;
  paymentUrl: string;
}

export interface PaymentWebhook {
  payment_id: string;
  payment_status: string;
  pay_amount: number;
  pay_currency: string;
  order_id: string;
}
