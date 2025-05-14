import React, { useState, useRef } from 'react';
import { Printer, Download, Search, Eye } from 'lucide-react';
import { BulletinPreview } from './BulletinPreview';
import { useReactToPrint } from 'react-to-print';

interface BulletinListProps {
  etudiants: Etudiant[];
  cours: Cours[];
  enseignants: Enseignant[];
  notes: Note[];
}

export function BulletinList({ etudiants, cours, enseignants, notes }: BulletinListProps) {
  const [selectedClasse, setSelectedClasse] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [previewEtudiant, setPreviewEtudiant] = useState<Etudiant | null>(null);
  const [printingAll, setPrintingAll] = useState(false);
  const bulkPrintRef = useRef<HTMLDivElement>(null);

  const filteredEtudiants = etudiants.filter(etudiant => {
    const matchesClasse = selectedClasse === 'all' || etudiant.classe === selectedClasse;
    const matchesSearch = 
      etudiant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      etudiant.prenom.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClasse && matchesSearch;
  });

  const handlePrintAll = useReactToPrint({
    content: () => bulkPrintRef.current,
    onBeforeGetContent: () => {
      setPrintingAll(true);
      return Promise.resolve();
    },
    onAfterPrint: () => {
      setPrintingAll(false);
    },
  });

  return (
    <div className="space-y-6">
      {/* Filtres */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label htmlFor="classe" className="block text-sm font-medium text-gray-700 mb-1">
              Filtrer par classe
            </label>
            <select
              id="classe"
              value={selectedClasse}
              onChange={(e) => setSelectedClasse(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            >
              <option value="all">Toutes les classes</option>
              <option value="1">1ère année</option>
              <option value="2">2ème année</option>
              <option value="4">4ème année</option>
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
              Rechercher un étudiant
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher par nom ou prénom..."
                className="block w-full pl-10 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
          </div>
        </div>

        {selectedClasse !== 'all' && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={handlePrintAll}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
            >
              <Printer className="w-4 h-4 mr-2" />
              Imprimer tous les bulletins de la {selectedClasse}ère année
            </button>
          </div>
        )}
      </div>

      {/* Liste des étudiants */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {filteredEtudiants.map((etudiant) => (
            <li key={etudiant.id}>
              <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <span className="text-lg font-medium text-green-800">
                        {etudiant.prenom[0]}{etudiant.nom[0]}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      {etudiant.prenom} {etudiant.nom}
                    </h3>
                    <div className="mt-1 text-sm text-gray-500">
                      <span className="bg-green-100 text-green-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                        {etudiant.classe}ème année
                      </span>
                      {etudiant.date_naissance && (
                        <span className="text-gray-500">
                          {new Date(etudiant.date_naissance).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => setPreviewEtudiant(etudiant)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Voir le bulletin
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {previewEtudiant && (
        <BulletinPreview
          etudiant={previewEtudiant}
          cours={cours}
          notes={notes}
          enseignants={enseignants}
          onClose={() => setPreviewEtudiant(null)}
        />
      )}

      {/* Zone d'impression en masse (cachée) */}
      <div className="hidden">
        <div ref={bulkPrintRef}>
          {printingAll && filteredEtudiants.map((etudiant, index) => (
            <div key={etudiant.id} className={index > 0 ? 'page-break-before-always' : ''}>
              <BulletinPreview
                etudiant={etudiant}
                cours={cours}
                notes={notes}
                enseignants={enseignants}
                onClose={() => {}}
                printMode
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
