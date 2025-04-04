import React, { useState } from 'react';
import { Save, Plus, Minus } from 'lucide-react';

interface MatiereFormProps {
  onSubmit: (matiere: Omit<Matiere, "id">) => void;
  enseignants: Enseignant[];
  initialData?: Matiere;
}

export function MatiereForm({ onSubmit, enseignants, initialData }: MatiereFormProps) {
  const [formData, setFormData] = useState<Omit<Matiere, "id">>({
    nom: initialData?.nom || '',
    cours: initialData?.cours || [],
  });

  const [nouveauCours, setNouveauCours] = useState<Omit<Cours, "id">>({
    nom: '',
    description: '',
    coefficient: 1,
    heures: undefined,
    enseignantId: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    if (!initialData) {
      setFormData({ nom: '', cours: [] });
      setNouveauCours({
        nom: '',
        description: '',
        coefficient: 1,
        heures: undefined,
        enseignantId: '',
      });
    }
  };

  const ajouterCours = () => {
    if (nouveauCours.nom && nouveauCours.description && nouveauCours.enseignantId) {
      setFormData({
        ...formData,
        cours: [...formData.cours, nouveauCours],
      });
      setNouveauCours({
        nom: '',
        description: '',
        coefficient: 1,
        heures: undefined,
        enseignantId: '',
      });
    }
  };

  const supprimerCours = (index: number) => {
    setFormData({
      ...formData,
      cours: formData.cours.filter((_, i) => i !== index),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
          Nom de la matière
        </label>
        <input
          type="text"
          id="nom"
          value={formData.nom}
          onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          required
        />
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Cours associés</h3>
        
        <div className="space-y-4">
          {formData.cours.map((cours, index) => {
            const enseignant = enseignants.find(e => e.id === cours.enseignantId);
            return (
              <div key={cours.id || index} className="flex items-center space-x-4 bg-gray-50 p-3 rounded-md group">
                <div className="flex-grow">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{cours.nom}</p>
                    <span className="text-sm text-gray-500">Coefficient: {cours.coefficient}</span>
                  </div>
                  <p className="text-sm text-gray-600">{cours.description}</p>
                  <p className="text-sm text-gray-500">
                    Enseignant: {enseignant ? `${enseignant.prenom} ${enseignant.nom}` : 'Non assigné'}
                    {cours.heures && ` • ${cours.heures}h`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => supprimerCours(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-600"
                >
                  <Minus className="w-4 h-4" />
                </button>
              </div>
            );
          })}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="coursNom" className="block text-sm font-medium text-gray-700">
                Nom du cours
              </label>
              <input
                type="text"
                id="coursNom"
                value={nouveauCours.nom}
                onChange={(e) => setNouveauCours({ ...nouveauCours, nom: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label htmlFor="coursCoefficient" className="block text-sm font-medium text-gray-700">
                Coefficient
              </label>
              <input
                type="number"
                id="coursCoefficient"
                min="1"
                max="10"
                value={nouveauCours.coefficient}
                onChange={(e) => setNouveauCours({ ...nouveauCours, coefficient: parseInt(e.target.value) })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>
            <div>
              <label htmlFor="coursEnseignant" className="block text-sm font-medium text-gray-700">
                Enseignant
              </label>
              <select
                id="coursEnseignant"
                value={nouveauCours.enseignantId}
                onChange={(e) => setNouveauCours({ ...nouveauCours, enseignantId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              >
                <option value="">Sélectionner un enseignant</option>
                {enseignants.map((enseignant) => (
                  <option key={enseignant.id} value={enseignant.id}>
                    {enseignant.prenom} {enseignant.nom}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="coursHeures" className="block text-sm font-medium text-gray-700">
                Heures (optionnel)
              </label>
              <input
                type="number"
                id="coursHeures"
                min="1"
                value={nouveauCours.heures || ''}
                onChange={(e) => setNouveauCours({ ...nouveauCours, heures: e.target.value ? parseInt(e.target.value) : undefined })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div className="col-span-2">
              <label htmlFor="coursDescription" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="coursDescription"
                value={nouveauCours.description}
                onChange={(e) => setNouveauCours({ ...nouveauCours, description: e.target.value })}
                rows={2}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              />
            </div>
          </div>

          <button
            type="button"
            onClick={ajouterCours}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter un cours
          </button>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <Save className="w-4 h-4 mr-2" />
          {initialData ? 'Mettre à jour' : 'Enregistrer la matière'}
        </button>
      </div>
    </form>
  );
}