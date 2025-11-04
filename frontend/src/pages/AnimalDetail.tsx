import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import WebApp from '@twa-dev/sdk';
import { animalsAPI, paymentsAPI, Animal } from '../services/api';

const AnimalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadAnimal(id);
    }
  }, [id]);

  const loadAnimal = async (animalId: string) => {
    try {
      setLoading(true);
      const response = await animalsAPI.getAnimalById(animalId);
      setAnimal(response.animal);
    } catch (error) {
      console.error('Failed to load animal:', error);
      WebApp.showAlert('Failed to load animal details');
    } finally {
      setLoading(false);
    }
  };

  const handlePayMaintenance = async () => {
    if (!animal) return;

    try {
      const response = await paymentsAPI.createPayment({
        animalType: animal.type,
        type: 'maintenance',
        currency: 'TON',
      });

      if (response.paymentUrl) {
        WebApp.openLink(response.paymentUrl);
      } else {
        WebApp.showAlert('Payment created successfully! (Mock mode)');
      }
    } catch (error) {
      console.error('Payment error:', error);
      WebApp.showAlert('Failed to create payment');
    }
  };

  const getAnimalEmoji = (type: string) => {
    switch (type) {
      case 'chicken':
        return '🐔';
      case 'pig':
        return '🐷';
      case 'cow':
        return '🐄';
      default:
        return '🐾';
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

  if (!animal) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Animal not found</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6">
        <button
          onClick={() => navigate('/')}
          className="mb-4 flex items-center text-white"
        >
          <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>
        <div className="flex items-center space-x-4">
          <span className="text-6xl">{getAnimalEmoji(animal.type)}</span>
          <div>
            <h1 className="text-2xl font-bold">
              {animal.name || t(`animals.${animal.type}`)}
            </h1>
            <p className="text-blue-100">{t(`home.status.${animal.status}`)}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Progress */}
        {animal.progress !== undefined && (
          <div className="bg-white rounded-lg shadow p-4">
            <h2 className="font-semibold mb-3">{t('animal.progress')}</h2>
            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{animal.progress}%</span>
                <span>{animal.marketInfo?.growthPeriodMonths} {t('market.months')}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-500 h-3 rounded-full transition-all"
                  style={{ width: `${animal.progress}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Details */}
        <div className="bg-white rounded-lg shadow p-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">{t('animal.purchaseDate')}</span>
            <span className="font-semibold">
              {new Date(animal.purchaseDate).toLocaleDateString('ru-RU')}
            </span>
          </div>
          {animal.slaughterDate && (
            <div className="flex justify-between">
              <span className="text-gray-600">{t('animal.expectedDate')}</span>
              <span className="font-semibold">
                {new Date(animal.slaughterDate).toLocaleDateString('ru-RU')}
              </span>
            </div>
          )}
          {animal.marketInfo && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('market.price')}</span>
                <span className="font-semibold">${animal.marketInfo.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{t('market.yield')}</span>
                <span className="font-semibold">{animal.marketInfo.expectedYield}</span>
              </div>
            </>
          )}
        </div>

        {/* Photos */}
        <div className="bg-white rounded-lg shadow p-4">
          <h2 className="font-semibold mb-3">{t('animal.photos')}</h2>
          {animal.media && animal.media.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {animal.media.map((media) => (
                <img
                  key={media.id}
                  src={media.url}
                  alt="Animal"
                  className="w-full h-32 object-cover rounded"
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">{t('animal.noPhotos')}</p>
          )}
        </div>

        {/* Actions */}
        {animal.status === 'growing' && animal.marketInfo && (
          <button
            onClick={handlePayMaintenance}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            {t('animal.payMaintenance')} - ${animal.marketInfo.maintenanceCost}
          </button>
        )}
      </div>
    </div>
  );
};

export default AnimalDetail;
