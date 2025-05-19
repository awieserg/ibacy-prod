import React, { useState } from 'react';
import { Save, School, User, Calendar, Phone, Mail, MapPin } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import type { Database } from '../types/database.types';

type Settings = Database['public']['Tables']['settings']['Row'];

interface ParametresProps {
  onClose?: () => void;
}

export function Parametres({ onClose }: ParametresProps) {
  const [settings, updateSettings, loading] = useSettings();
  const [formData, setFormData] = useState<Omit<Settings, 'id' | 'updated_at'>>({
    institut_nom: settings.institut_nom,
    institut_adresse: settings.institut_adresse,
    institut_telephone: settings.institut_telephone,
    institut_email: settings.institut_email,
    institut_site_web: settings.institut_site_web,
    annee_academique_debut: settings.annee_academique_debut,
    annee_academique_fin: settings.annee_academique_fin,
    directeur_academique_nom: settings.directeur_academique_nom,
    directeur_academique_titre: settings.directeur_academique_titre,
    directeur_general_nom: settings.directeur_general_nom,
    directeur_general_titre: settings.directeur_general_titre
  });
  const [activeTab, setActiveTab] = useState<'institut' | 'academique' | 'directeurs'>('institut');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveStatus('saving');
    
    try {
      const success = await updateSettings(formData);
      setSaveStatus(success ? 'success' : 'error');
      
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const getSaveButtonText = () => {
    switch (saveStatus) {
      case 'saving':
        return 'Enregistrement...';
      case 'success':
        return 'Enregistré !';
      case 'error':
        return 'Erreur !';
      default:
        return 'Enregistrer les modifications';
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900">Paramètres de l'application</h2>
        <p className="mt-1 text-sm text-gray-500">
          Configurez les paramètres généraux de l'application
        </p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('institut')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'institut'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <School className="w-5 h-5 inline-block mr-2" />
              Institut
            </button>
            <button
              onClick={() => setActiveTab('academique')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'academique'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-5 h-5 inline-block mr-2" />
              Année Académique
            </button>
            <button
              onClick={() => setActiveTab('directeurs')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'directeurs'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <User className="w-5 h-5 inline-block mr-2" />
              Directeurs
            </button>
          </nav>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {activeTab === 'institut' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nom de l'institut
                </label>
                <input
                  type="text"
                  value={formData.institut_nom}
                  onChange={(e) => setFormData({
                    ...formData,
                    institut_nom: e.target.value
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Adresse
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    <MapPin className="h-5 w-5" />
                  </span>
                  <input
                    type="text"
                    value={formData.institut_adresse}
                    onChange={(e) => setFormData({
                      ...formData,
                      institut_adresse: e.target.value
                    })}
                    className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Téléphone
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    <Phone className="h-5 w-5" />
                  </span>
                  <input
                    type="tel"
                    value={formData.institut_telephone}
                    onChange={(e) => setFormData({
                      ...formData,
                      institut_telephone: e.target.value
                    })}
                    className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    type="email"
                    value={formData.institut_email}
                    onChange={(e) => setFormData({
                      ...formData,
                      institut_email: e.target.value
                    })}
                    className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Site Web
                </label>
                <input
                  type="url"
                  value={formData.institut_site_web || ''}
                  onChange={(e) => setFormData({
                    ...formData,
                    institut_site_web: e.target.value
                  })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                />
              </div>
            </div>
          )}

          {activeTab === 'academique' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Début de l'année académique
                  </label>
                  <input
                    type="date"
                    value={formData.annee_academique_debut}
                    onChange={(e) => setFormData({
                      ...formData,
                      annee_academique_debut: e.target.value
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fin de l'année académique
                  </label>
                  <input
                    type="date"
                    value={formData.annee_academique_fin}
                    onChange={(e) => setFormData({
                      ...formData,
                      annee_academique_fin: e.target.value
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'directeurs' && (
            <div className="space-y-8">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Directeur Académique</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={formData.directeur_academique_nom}
                      onChange={(e) => setFormData({
                        ...formData,
                        directeur_academique_nom: e.target.value
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Titre
                    </label>
                    <input
                      type="text"
                      value={formData.directeur_academique_titre}
                      onChange={(e) => setFormData({
                        ...formData,
                        directeur_academique_titre: e.target.value
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Directeur Général</h3>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      value={formData.directeur_general_nom}
                      onChange={(e) => setFormData({
                        ...formData,
                        directeur_general_nom: e.target.value
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Titre
                    </label>
                    <input
                      type="text"
                      value={formData.directeur_general_titre}
                      onChange={(e) => setFormData({
                        ...formData,
                        directeur_general_titre: e.target.value
                      })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saveStatus === 'saving'}
              className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                saveStatus === 'saving'
                  ? 'bg-gray-400 cursor-not-allowed'
                  : saveStatus === 'success'
                  ? 'bg-green-600'
                  : saveStatus === 'error'
                  ? 'bg-red-600'
                  : 'bg-green-600 hover:bg-green-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
            >
              <Save className="w-4 h-4 mr-2" />
              {getSaveButtonText()}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
