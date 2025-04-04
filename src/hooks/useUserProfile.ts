import React, { useState, useEffect } from 'react';
import { Mail, Phone, LogOut, X, Save, School } from 'lucide-react';
import { useAuthContext } from './AuthProvider';
import { useUserProfile } from '../hooks/useUserProfile';

interface UserProfileProps {
  onClose: () => void;
}

export function UserProfile({ onClose }: UserProfileProps) {
  const { user, signOut } = useAuthContext();
  const { profile, loading, updateProfile } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  });

  // Mettre à jour le formulaire quand le profil est chargé
  useEffect(() => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Always close the modal, regardless of success or failure
      onClose();
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-md w-full p-6">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden max-w-md w-full">
      <div className="bg-green-600 px-6 py-4 flex justify-between items-center">
        <h3 className="text-lg font-medium text-white">Mon Profil</h3>
        <button
          onClick={onClose}
          className="text-white hover:text-green-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-green-600 p-3 rounded-full">
                <School className="h-12 w-12 text-white" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nom complet
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  value={user?.email}
                  disabled
                  className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 bg-gray-50 text-gray-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                  <Phone className="h-4 w-4" />
                </span>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="flex-1 block w-full rounded-none rounded-r-md border-gray-300 focus:border-green-500 focus:ring-green-500"
                  placeholder="(+225) XX XX XX XX XX"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <Save className="w-4 h-4 mr-2" />
                Enregistrer
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-center">
              <div className="bg-green-600 p-3 rounded-full">
                <School className="h-12 w-12 text-white" />
              </div>
            </div>

            <div className="text-center">
              <h3 className="text-xl font-semibold text-gray-900">
                {profile?.full_name || 'Utilisateur'}
              </h3>
              <p className="text-sm text-gray-500">{profile?.role}</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-gray-600 bg-gray-50 p-3 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400" />
                <span>{user?.email}</span>
              </div>
              {profile?.phone && (
                <div className="flex items-center space-x-3 text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-6">
              <button
                onClick={() => setIsEditing(true)}
                className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
              >
                <School className="w-4 h-4 mr-2" />
                Modifier le profil
              </button>

              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Se déconnecter
              </button>

              <button
                onClick={onClose}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <X className="w-4 h-4 mr-2" />
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
