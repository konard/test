import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { animalsAPI, Animal } from '../services/api';
import AnimalCard from '../components/AnimalCard';

const Home: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnimals();
  }, []);

  const loadAnimals = async () => {
    try {
      setLoading(true);
      const response = await animalsAPI.getMyAnimals();
      setAnimals(response.animals);
    } catch (error) {
      console.error('Failed to load animals:', error);
    } finally {
      setLoading(false);
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
      <h1 className="text-2xl font-bold mb-6">{t('home.title')}</h1>

      {animals.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4 text-lg">{t('home.empty')}</p>
          <button
            onClick={() => navigate('/market')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            {t('home.goToMarket')}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {animals.map((animal) => (
            <AnimalCard
              key={animal.id}
              animal={animal}
              onClick={() => navigate(`/animal/${animal.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
