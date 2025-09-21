import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const AddDonation = () => {
  const [formData, setFormData] = useState({
    donor_name: '',
    project_id: '',
    amount: ''
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await axios.get('/projects');
      setProjects(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des projets');
      console.error('Projects error:', error);
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.donor_name || !formData.project_id || !formData.amount) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (parseFloat(formData.amount) <= 0) {
      toast.error('Le montant doit être supérieur à 0');
      return;
    }

    setLoading(true);

    try {
      await axios.post('/donations', {
        ...formData,
        amount: parseFloat(formData.amount)
      });
      
      toast.success('Donation ajoutée avec succès !');
      setFormData({
        donor_name: '',
        project_id: '',
        amount: ''
      });
      
      // Rediriger vers le dashboard après 1 seconde
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de l\'ajout de la donation');
      console.error('Add donation error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loadingProjects) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des projets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Ajouter une donation
          </h1>
          <p className="text-gray-600 text-sm md:text-base">
            Enregistrez une nouvelle donation caritative
          </p>
        </div>

        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="form-group">
              <label htmlFor="donor_name" className="form-label">
                Nom du donateur *
              </label>
              <input
                type="text"
                id="donor_name"
                name="donor_name"
                className="form-input"
                placeholder="Entrez le nom du donateur"
                value={formData.donor_name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="project_id" className="form-label">
                Projet concerné *
              </label>
              <select
                id="project_id"
                name="project_id"
                className="form-select"
                value={formData.project_id}
                onChange={handleChange}
                required
              >
                <option value="">Sélectionnez un projet</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="amount" className="form-label">
                Montant (DA) *
              </label>
              <input
                type="number"
                id="amount"
                name="amount"
                className="form-input"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="btn btn-secondary order-2 sm:order-1"
                disabled={loading}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary order-1 sm:order-2"
                disabled={loading}
              >
                {loading ? 'Ajout en cours...' : 'Ajouter la donation'}
              </button>
            </div>
          </form>
        </div>

        {/* Projects Info */}
        <div className="mt-6 md:mt-8 card bg-gray-50">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Projets disponibles
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {projects.map((project) => (
              <div key={project.id} className="p-3 bg-white rounded-lg border hover:shadow-md transition-shadow">
                <h4 className="font-medium text-gray-900 text-sm md:text-base">{project.name}</h4>
                {project.description && (
                  <p className="text-xs md:text-sm text-gray-600 mt-1">{project.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddDonation;
