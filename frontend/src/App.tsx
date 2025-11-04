import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Market from './pages/Market';
import AnimalDetail from './pages/AnimalDetail';
import Profile from './pages/Profile';
import './locales/i18n';

const AppContent: React.FC = () => {
  const { user, loading, error } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-6">
          <p className="text-red-500 mb-4">{error}</p>
          <p className="text-gray-600">Please open this app from Telegram</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-center p-6">
          <p className="text-gray-600">Please open this app from Telegram</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/market" element={<Market />} />
          <Route path="/animal/:id" element={<AnimalDetail />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
        <Navigation />
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
