import React, { useState } from 'react';
import { MoreVertical, Plus, Pencil, Trash2 } from 'lucide-react';
import { MatiereForm } from './MatiereForm';

interface MatiereListProps {
  matieres: Matiere[];
  enseignants: Enseignant[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, matiere: Omit<Matiere, "id">) => void;
}

export function MatiereList({ matieres, enseignants, onDelete, onUpdate }: MatiereListProps) {
  const [selectedMatiere, setSelectedMatiere] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showActions, setShowActions] = useState<string | null>(null);

  const getEnseignantNom = (enseignantId: string) => {
    const enseignant = enseignants.find(e => e.id === enseignantId);
    return enseignant ? `${enseignant.prenom} ${enseignant.nom}` : 'Non assigné';
  };

  const handleMatiereClick = (id: string) => {
    setSelectedMatiere(selectedMatiere === id ? null : id);
    setShowActions(null);
  };

  const handleEdit = (matiere: Matiere) => {
    setShowForm(true);
    setSelectedMatiere(matiere.id);
    setShowActions(null);
  };

  return (
    <div className="space-y-4">
      {matieres.map((matiere) => (
        <div key={matiere.id} className="bg-white rounded-lg shadow">
          <div 
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50"
            onClick={() => handleMatiereClick(matiere.id)}
          >
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">{matiere.nom}</h3>
                <div className="relative">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowActions(showActions === matiere.id ? null : matiere.id);
                    }}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                  
                  {showActions === matiere.id && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                      <div className="py-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(matiere);
                          }}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Modifier
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDelete(matiere.id);
                          }}
                          className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full opacity-50"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Supprimer
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-500">{matiere.cours.length} cours</p>
            </div>
          </div>

          {selectedMatiere === matiere.id && (
            <div className="border-t border-gray-200 p-4">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-gray-900">Cours</h4>
                <button
                  onClick={() => handleEdit(matiere)}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter un cours
                </button>
              </div>
              
              <div className="space-y-3">
                {matiere.cours.map((cours) => (
                  <div
                    key={cours.id}
                    className="bg-gray-50 p-3 rounded-md"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium text-gray-900">{cours.nom}</h5>
                          <span className="text-sm text-gray-500">Coefficient: {cours.coefficient}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{cours.description}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Enseignant: {getEnseignantNom(cours.enseignantId)}
                          {cours.heures && ` • ${cours.heures}h`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {matiere.cours.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">
                    Aucun cours associé à cette matière
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {showForm && selectedMatiere && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Modifier la matière</h2>
            <MatiereForm
              onSubmit={(updatedMatiere) => {
                onUpdate(selectedMatiere, updatedMatiere);
                setShowForm(false);
              }}
              enseignants={enseignants}
              initialData={matieres.find(m => m.id === selectedMatiere)}
            />
            <button
              onClick={() => setShowForm(false)}
              className="mt-4 text-sm text-gray-600 hover:text-gray-900"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}