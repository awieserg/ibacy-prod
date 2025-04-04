import React, { useState } from 'react';
import { Save } from 'lucide-react';

interface EnseignantFormProps {
  onSubmit: (enseignant: Omit<Enseignant, "id">) => void;
  initialData?: Enseignant;
  cours: Cours[];
}

export function EnseignantForm({ onSubmit, initialData, cours }: EnseignantFormProps) {
  const [formData, setFormData] = useState({
    nom: initialData?.nom || '',
    prenom: initialData?.prenom || '',
    cours_ids: initialData?.cours_ids || [] as string[],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    if (!initialData) {
      setFormData({ nom: '', prenom: '', cours_ids: [] });
    }
  };

  const handleCoursChange = (coursId: string) => {
    setFormData(prev => ({
      ...prev,
      cours_ids: prev.cours_ids.includes(coursId)
        ? prev.cours_ids.filter(id => id !== coursId)
        : [...prev.cours_ids, coursId]
    }));
  };

  // Grouper les cours par matière
  const coursParMatiere = cours.reduce((acc, cours) => {
    if (!acc[cours.matiere_nom]) {
      acc[cours.matiere_nom] = [];
    }
    acc[cours.matiere_nom].push(cours);
    return acc;
  }, {} as Record<string, Cours[]>);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
            Nom
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
        <div>
          <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">
            Prénom
          </label>
          <input
            type="text"
            id="prenom"
            value={formData.prenom}
            onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Cours enseignés
        </label>
        <div className="space-y-4">
          {Object.entries(coursParMatiere).map(([matiere, coursList]) => (
            <div key={matiere} className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2">{matiere}</h4>
              <div className="space-y-2">
                {coursList.map((cours) => (
                  <label key={cours.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.cours_ids.includes(cours.id)}
                      onChange={() => handleCoursChange(cours.id)}
                      className="rounded border-gray-300 text-green-600 focus:ring-green-500 mr-2"
                    />
                    <span className="text-sm text-gray-700">{cours.nom}</span>
                    {cours.heures && (
                      <span className="text-sm text-gray-500 ml-2">
                        ({cours.heures}h)
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
        >
          <Save className="w-4 h-4 mr-2" />
          {initialData ? 'Mettre à jour' : 'Enregistrer'}
        </button>
      </div>
    </form>
  );
}