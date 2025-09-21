import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/dashboard');
      setDashboardData(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement des données');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatTime = (dateString) => {
    return format(new Date(dateString), 'HH:mm', { locale: fr });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="card text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchDashboardData} className="btn btn-primary">
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Tableau de bord
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          {format(new Date(dashboardData?.date), 'EEEE d MMMM yyyy', { locale: fr })}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-green-600 mb-1">Total du jour</p>
              <p className="text-xl md:text-2xl font-bold text-green-700">
                {formatCurrency(dashboardData?.totalAmount || 0)}
              </p>
            </div>
            <div className="text-2xl md:text-3xl opacity-80">💰</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-blue-600 mb-1">Nombre de donations</p>
              <p className="text-xl md:text-2xl font-bold text-blue-700">
                {dashboardData?.donations?.length || 0}
              </p>
            </div>
            <div className="text-2xl md:text-3xl opacity-80">📊</div>
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-shadow sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-purple-600 mb-1">Projets actifs</p>
              <p className="text-xl md:text-2xl font-bold text-purple-700">
                {dashboardData?.byProject?.filter(p => p.total > 0).length || 0}
              </p>
            </div>
            <div className="text-2xl md:text-3xl opacity-80">🎯</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Donations by Project */}
        <div className="card">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
            Donations par projet
          </h2>
          {dashboardData?.byProject?.length > 0 ? (
            <div className="space-y-2">
              {dashboardData.byProject.map((project, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-700 text-sm md:text-base">{project.project_name}</span>
                  <span className="font-bold text-green-600 text-sm md:text-base">
                    {formatCurrency(project.total)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2 opacity-50">📊</div>
              <p className="text-gray-500">Aucune donation aujourd'hui</p>
            </div>
          )}
        </div>

        {/* Recent Donations */}
        <div className="card">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-2">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              Dernières donations
            </h2>
            <Link to="/add-donation" className="btn btn-primary btn-sm self-start sm:self-auto">
              Ajouter
            </Link>
          </div>
          
          {dashboardData?.donations?.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {dashboardData.donations.slice(0, 10).map((donation) => (
                <div key={donation.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm md:text-base truncate">{donation.donor_name}</p>
                    <p className="text-xs md:text-sm text-gray-600 truncate">{donation.project_name}</p>
                  </div>
                  <div className="text-right ml-2">
                    <p className="font-bold text-green-600 text-sm md:text-base">
                      {formatCurrency(donation.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTime(donation.donation_date)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2 opacity-50">📝</div>
              <p className="text-gray-500 mb-4">Aucune donation aujourd'hui</p>
              <Link to="/add-donation" className="btn btn-primary btn-sm">
                Ajouter la première donation
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
