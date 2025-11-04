import React from 'react';
import { useTranslation } from 'react-i18next';
import { Animal } from '../services/api';

interface AnimalCardProps {
  animal: Animal;
  onClick?: () => void;
}

const AnimalCard: React.FC<AnimalCardProps> = ({ animal, onClick }) => {
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

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU');
  };

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md p-4 cursor-pointer hover:shadow-lg transition-shadow"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <span className="text-4xl">{getAnimalEmoji(animal.type)}</span>
          <div>
            <h3 className="font-semibold text-lg">
              {animal.name || t(`animals.${animal.type}`)}
            </h3>
            <span className="text-sm text-gray-500">
              {t(`home.status.${animal.status}`)}
            </span>
          </div>
        </div>
      </div>

      {animal.progress !== undefined && (
        <div className="mb-2">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>{t('animal.progress')}</span>
            <span>{animal.progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all"
              style={{ width: `${animal.progress}%` }}
            />
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500 mt-2">
        {t('animal.purchaseDate')}: {formatDate(animal.purchaseDate)}
      </div>
    </div>
  );
};

export default AnimalCard;
