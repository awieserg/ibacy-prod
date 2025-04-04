import React, { useState } from 'react';
import { Save } from 'lucide-react';

interface NoteFormProps {
  onSubmit: (note: Omit<Note, "id">) => void;
  etudiant_id: string;
  cours_id: string;
  initialData?: Note;
}

export function NoteForm({ onSubmit, etudiant_id, cours_id, initialData }: NoteFormProps) {
  const [formData, setFormData] = useState<Omit<Note, "id">>({
    etudiant_id,
    cours_id,
    valeur: initialData?.valeur || 0,
    semestre: initialData?.semestre || 1,
    appreciation: initialData?.appreciation || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="valeur" className="block text-sm font-medium text-gray-700">
            Note
          </label>
          <input
            type="number"
            id="valeur"
            min="0"
            max="20"
            step="0.25"
            value={formData.valeur}
            onChange={(e) => setFormData({ ...formData, valeur: parseFloat(e.target.value) })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          />
        </div>
        <div>
          <label htmlFor="semestre" className="block text-sm font-medium text-gray-700">
            Semestre
          </label>
          <select
            id="semestre"
            value={formData.semestre}
            onChange={(e) => setFormData({ ...formData, semestre: parseInt(e.target.value) as 1 | 2 })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            required
          >
            <option value={1}>Premier semestre</option>
            <option value={2}>Deuxième semestre</option>
          </select>
        </div>
        <div className="col-span-2">
          <label htmlFor="appreciation" className="block text-sm font-medium text-gray-700">
            Appréciation
          </label>
          <textarea
            id="appreciation"
            value={formData.appreciation}
            onChange={(e) => setFormData({ ...formData, appreciation: e.target.value })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          />
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