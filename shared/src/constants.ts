import { AnimalMarketInfo, AnimalType } from './types';

// Animal market data
export const ANIMAL_MARKET: Record<AnimalType, AnimalMarketInfo> = {
  chicken: {
    type: 'chicken',
    price: 50,
    maintenanceCost: 10,
    growthPeriodMonths: 2,
    description: 'Курица — быстрый старт в фермерство',
    expectedYield: '2-3 кг мяса',
  },
  pig: {
    type: 'pig',
    price: 500,
    maintenanceCost: 50,
    growthPeriodMonths: 6,
    description: 'Свинья — оптимальное соотношение цены и выхода',
    expectedYield: '80-100 кг мяса',
  },
  cow: {
    type: 'cow',
    price: 2000,
    maintenanceCost: 150,
    growthPeriodMonths: 8,
    description: 'Корова — максимальная отдача',
    expectedYield: '200-300 кг мяса',
  },
};

// Payment currencies
export const SUPPORTED_CURRENCIES = ['TON', 'USDT', 'BTC', 'ETH'] as const;

// Admin whitelist (telegram IDs - should be in .env in production)
export const ADMIN_TELEGRAM_IDS = process.env.ADMIN_TELEGRAM_IDS?.split(',') || [];
