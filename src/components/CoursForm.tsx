import React, { useState, useMemo } from 'react';
import { Save } from 'lucide-react';

interface CoursFormProps {
  onSubmit: (cours: Omit<Cours, "id">) => void;
  enseignants: Enseignant[];
  cours: Cours[];
  initialData?: Cours;
}

export function CoursForm({ onSubmit, enseignants, cours, initialData }: CoursFormProps) {
  const [formData, setFormData] = useState<Omit<Cours, "id">>({
    nom: initialData?.nom || '',
    description: initialData?.description || '',
    matiere_nom: initialData?.matiere_nom || '',
    coefficient: initialData?.coefficient || 1,
    heures: initialData?.heures,
    enseignant_id: initialData?.enseignant_id || null,
    is_examen_final: initialData?.is_examen_final || false,
  });

  // Extraire les noms de matières uniques des cours existants
  const matieres = useMemo(() => {
    const uniqueMatieres = new Set(cours.map(c => c.matiere_nom));
    return Array.from(uniqueMatieres).sort();
  }, [cours]);

  const [nouvelleMatiere, setNouvelleMatiere] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    if (!initialData) {
      setFormData({
        nom: '',
        description: '',
        matiere_nom: '',
        coefficient: 1,
        heures: undefined,
        enseignant_id: null,
        is_examen_final: false,
      });
      setNouvelleMatiere(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="matiere_nom" className="block text-sm font-medium text-gray-700">
            Matière
          </label>
          <div className="mt-1 space-y-2">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="nouvelleMatiere"
                checked={nouvelleMatiere}
                onChange={(e) => {
                  setNouvelleMatiere(e.target.checked);
                  if (!e.target.checked) {
                    setFormData(prev => ({ ...prev, matiere_nom: '' }));
                  }
                }}
                className="rounded border-gray-300 text-green-600 focus:ring-green-500"
              />
              <label htmlFor="nouvelleMatiere" className="text-sm text-gray-600">
                Nouvelle matière
              </label>
            </div>
            {nouvelleMatiere ? (
              <input
                type="text"
                value={formData.matiere_nom}
                onChange={(e) => setFormData({ ...formData, matiere_nom: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                placeholder="Nom de la nouvelle matière"
                required
              />
            ) : (
              <select
                value={formData.matiere_nom}
                onChange={(e) => setFormData({ ...formData, matiere_nom: e.target.value })}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                required
              >
                <option value="">Sélectionner une matière</option>
                {matieres.map((matiere) => (
                  <option key={matiere} value={matiere}>
                    {matiere}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
        <div>
          <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
            Nom du cours
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
          <label htmlFor="coefficient" className="block text-sm font-medium text-gray-700">
            Coefficient
          </label>
          <input
            type="number"
            id="coefficient"
            min="1"
            max="10"
            value={formData.coefficient}
            onChange={(e) => setFormData({ ...formData, coefficient: parseInt(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label htmlFor="heures" className="block text-sm font-medium text-gray-700">
            Heures (optionnel)
          </label>
          <input
            type="number"
            id="heures"
            min="1"
            value={formData.heures || ''}
            onChange={(e) => setFormData({ ...formData, heures: e.target.value ? parseInt(e.target.value) : undefined })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          />
        </div>
        <div>
          <label htmlFor="enseignant" className="block text-sm font-medium text-gray-700">
            Enseignant (optionnel)
          </label>
          <select
            id="enseignant"
            value={formData.enseignant_id || ''}
            onChange={(e) => setFormData({ ...formData, enseignant_id: e.target.value || null })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            <option value="">Sélectionner un enseignant</option>
            {enseignants.map((enseignant) => (
              <option key={enseignant.id} value={enseignant.id}>
                {enseignant.prenom} {enseignant.nom}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description (optionnel)
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          />
        </div>
        <div className="col-span-2">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_examen_final"
              checked={formData.is_examen_final}
              onChange={(e) => setFormData({ ...formData, is_examen_final: e.target.checked })}
              className="rounded border-gray-300 text-green-600 focus:ring-green-500"
            />
            <label htmlFor="is_examen_final" className="text-sm text-gray-700">
              Ce cours fait partie des examens finaux
            </label>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
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