import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import WebApp from '@twa-dev/sdk';
import { animalsAPI, paymentsAPI, AnimalMarketInfo } from '../services/api';
import MarketCard from '../components/MarketCard';

const Market: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [animals, setAnimals] = useState<AnimalMarketInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    loadMarket();
  }, []);

  const loadMarket = async () => {
    try {
      setLoading(true);
      const response = await animalsAPI.getMarket();
      setAnimals(response.animals);
    } catch (error) {
      console.error('Failed to load market:', error);
      WebApp.showAlert('Failed to load market data');
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (animal: AnimalMarketInfo) => {
    try {
      setPurchasing(true);

      // Create payment
      const response = await paymentsAPI.createPayment({
        animalType: animal.type,
        type: 'purchase',
        currency: 'TON',
      });

      // Open payment URL
      if (response.paymentUrl) {
        WebApp.openLink(response.paymentUrl);
      } else {
        WebApp.showAlert('Payment created successfully! (Mock mode)');
        // In production, this would redirect to payment page
      }
    } catch (error) {
      console.error('Payment error:', error);
      WebApp.showAlert('Failed to create payment. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t('app.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 p-4">
      <h1 className="text-2xl font-bold mb-6">{t('market.title')}</h1>

      <div className="space-y-4">
        {animals.map((animal) => (
          <MarketCard
            key={animal.type}
            animal={animal}
            onBuy={() => handleBuy(animal)}
          />
        ))}
      </div>

      {purchasing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4">{t('payment.processing')}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Market;
