import React, { useState } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';

interface CoursListProps {
  cours: Cours[];
  enseignants: Enseignant[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export function CoursList({ cours, enseignants, onDelete, onEdit }: CoursListProps) {
  const [showActions, setShowActions] = useState<string | null>(null);

  const getEnseignantNom = (enseignant_id: string | null) => {
    if (!enseignant_id) return 'Non assigné';
    const enseignant = enseignants.find(e => e.id === enseignant_id);
    return enseignant ? `${enseignant.prenom} ${enseignant.nom}` : 'Non assigné';
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
    <div className="space-y-6">
      {Object.entries(coursParMatiere).map(([matiere, coursList]) => (
        <div key={matiere} className="bg-white rounded-lg shadow overflow-hidden">
          <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">{matiere}</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {coursList.map((cours) => (
              <div key={cours.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-medium text-gray-900">{cours.nom}</h4>
                      <div className="relative">
                        <button
                          onClick={() => setShowActions(showActions === cours.id ? null : cours.id)}
                          className="p-1 rounded-full hover:bg-gray-100"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-500" />
                        </button>
                        
                        {showActions === cours.id && (
                          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  onEdit(cours.id);
                                  setShowActions(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                              >
                                <Pencil className="w-4 h-4 mr-2" />
                                Modifier
                              </button>
                              <button
                                onClick={() => {
                                  onDelete(cours.id);
                                  setShowActions(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Supprimer
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{cours.description}</p>
                    <div className="mt-2 flex items-center text-sm text-gray-500 space-x-4">
                      <span>Coefficient: {cours.coefficient}</span>
                      {cours.heures && <span>{cours.heures}h</span>}
                      <span>Enseignant: {getEnseignantNom(cours.enseignant_id)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}