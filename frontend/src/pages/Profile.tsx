import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { paymentsAPI, Payment } from '../services/api';

const Profile: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {
    try {
      setLoading(true);
      const response = await paymentsAPI.getMyPayments();
      setPayments(response.payments);
    } catch (error) {
      console.error('Failed to load payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="pb-20 p-4">
      <h1 className="text-2xl font-bold mb-6">{t('profile.title')}</h1>

      {/* User Info */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="font-semibold mb-3">{t('profile.user')}</h2>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">ID</span>
            <span className="font-mono text-sm">{user?.telegramId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Name</span>
            <span>{user?.firstName}</span>
          </div>
          {user?.username && (
            <div className="flex justify-between">
              <span className="text-gray-600">Username</span>
              <span>@{user.username}</span>
            </div>
          )}
        </div>
      </div>

      {/* Language */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h2 className="font-semibold mb-3">{t('profile.language')}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => changeLanguage('ru')}
            className={`flex-1 py-2 px-4 rounded ${
              i18n.language === 'ru'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Русский
          </button>
          <button
            onClick={() => changeLanguage('en')}
            className={`flex-1 py-2 px-4 rounded ${
              i18n.language === 'en'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow p-4">
        <h2 className="font-semibold mb-3">{t('profile.payments')}</h2>
        {loading ? (
          <div className="text-center py-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          </div>
        ) : payments.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No payments yet</p>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div key={payment.id} className="border-b pb-3 last:border-b-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium capitalize">{payment.type}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(payment.createdAt).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      ${payment.amount} {payment.currency}
                    </p>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        payment.status === 'success'
                          ? 'bg-green-100 text-green-700'
                          : payment.status === 'failed'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {payment.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
