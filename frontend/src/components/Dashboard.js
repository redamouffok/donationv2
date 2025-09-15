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
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Tableau de bord
        </h1>
        <p className="text-gray-600">
          {format(new Date(dashboardData?.date), 'EEEE d MMMM yyyy', { locale: fr })}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="card bg-green-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Total du jour</p>
              <p className="text-2xl font-bold text-green-700">
                {formatCurrency(dashboardData?.totalAmount || 0)}
              </p>
            </div>
            <div className="text-3xl">💰</div>
          </div>
        </div>

        <div className="card bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Nombre de donations</p>
              <p className="text-2xl font-bold text-blue-700">
                {dashboardData?.donations?.length || 0}
              </p>
            </div>
            <div className="text-3xl">📊</div>
          </div>
        </div>

        <div className="card bg-purple-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Projets actifs</p>
              <p className="text-2xl font-bold text-purple-700">
                {dashboardData?.byProject?.filter(p => p.total > 0).length || 0}
              </p>
            </div>
            <div className="text-3xl">🎯</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Donations by Project */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Donations par projet
          </h2>
          {dashboardData?.byProject?.length > 0 ? (
            <div className="space-y-3">
              {dashboardData.byProject.map((project, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-700">{project.project_name}</span>
                  <span className="font-bold text-green-600">
                    {formatCurrency(project.total)}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Aucune donation aujourd'hui
            </p>
          )}
        </div>

        {/* Recent Donations */}
        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              Dernières donations
            </h2>
            <Link to="/add-donation" className="btn btn-primary text-sm">
              Ajouter
            </Link>
          </div>
          
          {dashboardData?.donations?.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {dashboardData.donations.slice(0, 10).map((donation) => (
                <div key={donation.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{donation.donor_name}</p>
                    <p className="text-sm text-gray-600">{donation.project_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
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
              <div className="text-4xl mb-2">📝</div>
              <p className="text-gray-500 mb-4">Aucune donation aujourd'hui</p>
              <Link to="/add-donation" className="btn btn-primary">
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
