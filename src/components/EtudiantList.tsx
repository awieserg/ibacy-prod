import React, { useState } from 'react';
import { Trash2, MoreVertical, Pencil, GraduationCap, Filter } from 'lucide-react';

interface EtudiantListProps {
  etudiants: Etudiant[];
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onSelectEtudiant: (id: string | null) => void;
}

export function EtudiantList({ etudiants, onDelete, onEdit, onSelectEtudiant }: EtudiantListProps) {
  const [showActions, setShowActions] = useState<string | null>(null);
  const [selectedEtudiant, setSelectedEtudiant] = useState<string | null>(null);
  const [selectedClasse, setSelectedClasse] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleSelectEtudiant = (id: string) => {
    const newSelectedId = selectedEtudiant === id ? null : id;
    setSelectedEtudiant(newSelectedId);
    onSelectEtudiant(newSelectedId);
  };

  // Get unique classes from students
  const classes = [...new Set(etudiants.map(e => e.classe))].sort();

  // Filter students based on class and search term
  const filteredEtudiants = etudiants.filter(etudiant => {
    const matchesClasse = selectedClasse === 'all' || etudiant.classe === selectedClasse;
    const matchesSearch = searchTerm === '' || 
      etudiant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      etudiant.prenom.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClasse && matchesSearch;
  });

  return (
    <div className="mt-6 space-y-4">
      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="classe" className="block text-sm font-medium text-gray-700 mb-1">
              Filtrer par classe
            </label>
            <div className="relative">
              <select
                id="classe"
                value={selectedClasse}
                onChange={(e) => setSelectedClasse(e.target.value)}
                className="block w-full rounded-md border-gray-300 pr-10 focus:border-green-500 focus:ring-green-500"
              >
                <option value="all">Toutes les classes</option>
                {classes.map((classe) => (
                  <option key={classe} value={classe}>
                    {classe}ème année
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <Filter className="h-4 w-4" />
              </div>
            </div>
          </div>
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Rechercher un étudiant
            </label>
            <input
              type="text"
              id="search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par nom ou prénom..."
              className="block w-full rounded-md border-gray-300 focus:border-green-500 focus:ring-green-500"
            />
          </div>
        </div>
        <div className="mt-2 text-sm text-gray-500">
          {filteredEtudiants.length} étudiant{filteredEtudiants.length !== 1 ? 's' : ''} trouvé{filteredEtudiants.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Liste des étudiants */}
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
                Classe
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date de naissance
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEtudiants.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                  Aucun étudiant ne correspond aux critères de recherche
                </td>
              </tr>
            ) : (
              filteredEtudiants.map((etudiant) => (
                <tr 
                  key={etudiant.id} 
                  className={`hover:bg-gray-50 ${selectedEtudiant === etudiant.id ? 'bg-green-50' : ''}`}
                >
                  <td className="px-6 py-4 whitespace-nowrap">{etudiant.nom}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{etudiant.prenom}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{etudiant.classe}ème année</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {etudiant.date_naissance ? new Date(etudiant.date_naissance).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="relative flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleSelectEtudiant(etudiant.id)}
                        className={`relative group flex items-center px-3 py-2 rounded-md transition-all duration-300 ${
                          selectedEtudiant === etudiant.id
                            ? 'bg-green-600 text-white shadow-lg scale-105'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        <GraduationCap className={`w-5 h-5 ${
                          selectedEtudiant === etudiant.id ? 'animate-bounce' : ''
                        }`} />
                        <span className={`ml-2 font-medium ${
                          selectedEtudiant === etudiant.id ? '' : 'group-hover:underline'
                        }`}>
                          Notes
                        </span>
                        {selectedEtudiant !== etudiant.id && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                          </span>
                        )}
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setShowActions(showActions === etudiant.id ? null : etudiant.id)}
                          className="p-2 rounded-md hover:bg-gray-100"
                        >
                          <MoreVertical className="w-5 h-5 text-gray-500" />
                        </button>
                        
                        {showActions === etudiant.id && (
                          <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  onEdit(etudiant.id);
                                  setShowActions(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                              >
                                <Pencil className="w-4 h-4 mr-2" />
                                Modifier
                              </button>
                              <button
                                onClick={() => {
                                  onDelete(etudiant.id);
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
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}