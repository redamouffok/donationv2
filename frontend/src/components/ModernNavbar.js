import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ModernNavbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const navItems = [
    { path: '/dashboard', label: 'Tableau de bord', icon: '📊' },
    { path: '/add-donation', label: 'Ajouter donation', icon: '➕' },
    { path: '/history', label: 'Historique', icon: '📅' }
  ];

  return (
    <>
      {/* Barre de navigation principale */}
      <nav className="navbar-modern">
        <div className="navbar-content">
          <Link to="/dashboard" className="navbar-brand">
            <span className="text-2xl">💚</span>
            <span>Gestion des Donations</span>
          </Link>
          
          <div className="navbar-user">
            <span className="text-sm text-gray-600">
              Bonjour, <span className="font-semibold text-gray-900">{user?.username}</span>
            </span>
            <button
              onClick={logout}
              className="btn btn-secondary btn-sm"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      {/* Navigation des sections principales */}
      <nav className="main-nav">
        <div className="main-nav-content">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
    </>
  );
};

export default ModernNavbar;
