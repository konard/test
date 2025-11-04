import React from 'react';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Reality Farm - Admin Panel</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="bg-blue-500 text-white px-4 py-3 rounded hover:bg-blue-600">
              Upload Media
            </button>
            <button className="bg-green-500 text-white px-4 py-3 rounded hover:bg-green-600">
              Update Animal Status
            </button>
            <button className="bg-purple-500 text-white px-4 py-3 rounded hover:bg-purple-600">
              View Users
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-600">Admin panel is ready for development</p>
          <p className="text-sm text-gray-500 mt-2">
            Connect to backend API at /admin endpoints with proper authentication
          </p>
        </div>

        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> This admin panel requires authentication.
            Your Telegram ID must be whitelisted in ADMIN_TELEGRAM_IDS environment variable.
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;
