import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.username, formData.password);
    
    if (result.success) {
      toast.success('Connexion réussie !');
    } else {
      toast.error(result.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="text-5xl mb-6">💚</div>
          <h1 className="login-title">
            Gestion des Donations
          </h1>
          <p className="login-subtitle">
            Connectez-vous à votre compte
          </p>
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Nom d'utilisateur
            </label>
            <input
              id="username"
              name="username"
              type="text"
              required
              className="form-input"
              placeholder="Entrez votre nom d'utilisateur"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="form-input"
              placeholder="Entrez votre mot de passe"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          
          <div className="mt-8">
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-lg w-full"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
