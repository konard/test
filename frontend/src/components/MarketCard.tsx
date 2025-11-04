import React from 'react';
import { useTranslation } from 'react-i18next';
import { AnimalMarketInfo } from '../services/api';

interface MarketCardProps {
  animal: AnimalMarketInfo;
  onBuy: () => void;
}

const MarketCard: React.FC<MarketCardProps> = ({ animal, onBuy }) => {
  const { t } = useTranslation();

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

  return (
    <div className="bg-white rounded-lg shadow-md p-5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-5xl">{getAnimalEmoji(animal.type)}</span>
          <div>
            <h3 className="font-bold text-xl">{t(`animals.${animal.type}`)}</h3>
            <p className="text-sm text-gray-600 mt-1">{animal.description}</p>
          </div>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t('market.price')}:</span>
          <span className="font-semibold">${animal.price}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t('market.maintenance')}:</span>
          <span className="font-semibold">${animal.maintenanceCost}/{t('market.months')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t('market.period')}:</span>
          <span className="font-semibold">{animal.growthPeriodMonths} {t('market.months')}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">{t('market.yield')}:</span>
          <span className="font-semibold">{animal.expectedYield}</span>
        </div>
      </div>

      <button
        onClick={onBuy}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
      >
        {t('market.buy')} - ${animal.price}
      </button>
    </div>
  );
};

export default MarketCard;
