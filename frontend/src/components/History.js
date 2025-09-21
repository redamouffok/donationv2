import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const History = () => {
  const [history, setHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [donationsForDate, setDonationsForDate] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingDonations, setLoadingDonations] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/donations/history');
      setHistory(response.data);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement de l\'historique');
      console.error('History error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDonationsForDate = async (date) => {
    try {
      setLoadingDonations(true);
      const response = await axios.get(`/donations/date/${date}`);
      setDonationsForDate(response.data);
    } catch (err) {
      console.error('Date donations error:', err);
    } finally {
      setLoadingDonations(false);
    }
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    fetchDonationsForDate(date);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'currency',
      currency: 'DZD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatTime = (dateString) => {
    return format(parseISO(dateString), 'HH:mm', { locale: fr });
  };

  const formatDate = (dateString) => {
    return format(parseISO(dateString), 'EEEE d MMMM yyyy', { locale: fr });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement de l'historique...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="card text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button onClick={fetchHistory} className="btn btn-primary">
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
          Historique des donations
        </h1>
        <p className="text-gray-600 text-sm md:text-base">
          Consultez l'historique des donations par jour
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* History List */}
        <div className="card">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
            Résumé par jour
          </h2>
          
          {history.length > 0 ? (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {history.map((day, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedDate === day.date
                      ? 'bg-green-50 border-green-200 shadow-sm'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100 hover:shadow-sm'
                  }`}
                  onClick={() => handleDateClick(day.date)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm md:text-base">
                        {formatDate(day.date)}
                      </p>
                      <p className="text-xs md:text-sm text-gray-600">
                        {day.donation_count} donation{day.donation_count > 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right ml-2">
                      <p className="font-bold text-green-600 text-sm md:text-base">
                        {formatCurrency(day.total_amount)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2 opacity-50">📅</div>
              <p className="text-gray-500">Aucun historique disponible</p>
            </div>
          )}
        </div>

        {/* Donations for Selected Date */}
        <div className="card">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
            {selectedDate ? `Donations du ${formatDate(selectedDate)}` : 'Sélectionnez une date'}
          </h2>
          
          {selectedDate ? (
            loadingDonations ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement...</p>
              </div>
            ) : donationsForDate.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {donationsForDate.map((donation) => (
                  <div key={donation.id} className="p-3 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors">
                    <div className="flex justify-between items-start">
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
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl mb-2 opacity-50">📝</div>
                <p className="text-gray-500">Aucune donation ce jour</p>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <div className="text-4xl mb-2 opacity-50">👆</div>
              <p className="text-gray-500">Cliquez sur une date pour voir les détails</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History;
