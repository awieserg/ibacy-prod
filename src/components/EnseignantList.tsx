import React, { useState } from 'react';
import { Trash2, MoreVertical, Pencil } from 'lucide-react';

interface EnseignantListProps {
  enseignants: Enseignant[];
  cours: Cours[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

export function EnseignantList({ enseignants, cours, onDelete, onEdit }: EnseignantListProps) {
  const [showActions, setShowActions] = useState<string | null>(null);

  const getCoursEnseignant = (cours_ids: string[] | undefined) => {
    if (!Array.isArray(cours_ids)) {
      return [];
    }
    return cours_ids.map(id => {
      const coursItem = cours.find(c => c.id === id);
      return coursItem ? `${coursItem.nom} (${coursItem.matiere_nom})` : '';
    }).filter(Boolean);
  };

  return (
    <div className="mt-6">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prénom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cours enseignés
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {enseignants.map((enseignant) => (
              <tr key={enseignant.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">{enseignant.nom}</td>
                <td className="px-6 py-4 whitespace-nowrap">{enseignant.prenom}</td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-2">
                    {getCoursEnseignant(enseignant.cours_ids).map((cours, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      >
                        {cours}
                      </span>
                    ))}
                    {(!enseignant.cours_ids || enseignant.cours_ids.length === 0) && (
                      <span className="text-sm text-gray-500 italic">
                        Aucun cours assigné
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="relative">
                    <button
                      onClick={() => setShowActions(showActions === enseignant.id ? null : enseignant.id)}
                      className="p-1 rounded-full hover:bg-gray-100"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-500" />
                    </button>
                    
                    {showActions === enseignant.id && (
                      <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              onEdit(enseignant.id);
                              setShowActions(null);
                            }}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                          >
                            <Pencil className="w-4 h-4 mr-2" />
                            Modifier
                          </button>
                          <button
                            onClick={() => {
                              onDelete(enseignant.id);
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}