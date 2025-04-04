import React, { useState } from 'react';
import { Printer, Download, Search, Eye } from 'lucide-react';
import { BulletinPreview } from './BulletinPreview';

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

  const filteredEtudiants = etudiants.filter(etudiant => {
    const matchesClasse = selectedClasse === 'all' || etudiant.classe === selectedClasse;
    const matchesSearch = 
      etudiant.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
      etudiant.prenom.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesClasse && matchesSearch;
  });

  const handlePrint = () => {
    window.print();
  };

  const getCoursAverages = (etudiantId: string, semestre: number) => {
    const etudiantNotes = notes.filter(note => 
      note.etudiant_id === etudiantId && 
      note.semestre === semestre
    );

    // Grouper les notes par cours
    const notesByCours = etudiantNotes.reduce((acc, note) => {
      const coursInfo = cours.find(c => c.id === note.cours_id);
      if (!coursInfo) return acc;

      if (!acc[coursInfo.id]) {
        acc[coursInfo.id] = {
          notes: [],
          coursInfo
        };
      }
      acc[coursInfo.id].notes.push(note);
      return acc;
    }, {} as Record<string, { notes: Note[], coursInfo: Cours }>);

    // Calculer la moyenne pour chaque cours
    return Object.values(notesByCours).map(({ notes, coursInfo }) => {
      const totalNotes = notes.reduce((sum, note) => sum + note.valeur, 0);
      const moyenne = notes.length > 0 ? +(totalNotes / notes.length).toFixed(2) : 0;
      const enseignant = enseignants.find(e => e.id === coursInfo.enseignant_id);

      return {
        coursInfo,
        moyenne,
        enseignant,
        appreciations: notes.map(note => note.appreciation).filter(Boolean)
      };
    }).sort((a, b) => a.coursInfo.matiere_nom.localeCompare(b.coursInfo.matiere_nom));
  };

  const calculerMoyenneGenerale = (coursAverages: ReturnType<typeof getCoursAverages>) => {
    if (coursAverages.length === 0) return 0;

    let totalPoints = 0;
    let totalCoefficients = 0;

    coursAverages.forEach(({ coursInfo, moyenne }) => {
      totalPoints += moyenne * coursInfo.coefficient;
      totalCoefficients += coursInfo.coefficient;
    });

    return totalCoefficients > 0 ? +(totalPoints / totalCoefficients).toFixed(2) : 0;
  };

  const handleDownload = (etudiant: Etudiant) => {
    const semestre1Averages = getCoursAverages(etudiant.id, 1);
    const semestre2Averages = getCoursAverages(etudiant.id, 2);
    const moyenne1 = calculerMoyenneGenerale(semestre1Averages);
    const moyenne2 = calculerMoyenneGenerale(semestre2Averages);
    const moyenneAnnuelle = +((moyenne1 + moyenne2) / 2).toFixed(2);

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bulletin - ${etudiant.prenom} ${etudiant.nom}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f8f9fa; }
            .header { margin-bottom: 30px; }
            .student-info { margin-bottom: 20px; }
            .results { margin-top: 30px; padding: 15px; background-color: #f8f9fa; }
            .appreciation { font-style: italic; color: #666; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
              table { page-break-inside: avoid; }
              .header, .student-info, .results { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Institut Biblique IBACY</h1>
            <p>Bulletin de notes - Année académique 2024-2025</p>
          </div>
          
          <div class="student-info">
            <h2>Informations de l'étudiant</h2>
            <p>Nom et Prénoms: ${etudiant.prenom} ${etudiant.nom}</p>
            <p>Classe: ${etudiant.classe}ème année</p>
          </div>

          <div class="notes">
            <h2>Relevé de notes</h2>
            
            <h3>Premier semestre</h3>
            <table>
              <thead>
                <tr>
                  <th>Cours</th>
                  <th>Enseignant</th>
                  <th>Coefficient</th>
                  <th>Moyenne/20</th>
                  <th>Appréciations</th>
                </tr>
              </thead>
              <tbody>
                ${semestre1Averages.map(({ coursInfo, moyenne, enseignant, appreciations }) => `
                  <tr>
                    <td>
                      ${coursInfo.nom}<br>
                      <small>(${coursInfo.matiere_nom})</small>
                    </td>
                    <td>${enseignant ? `${enseignant.prenom} ${enseignant.nom}` : 'Non assigné'}</td>
                    <td>${coursInfo.coefficient}</td>
                    <td>${moyenne}</td>
                    <td class="appreciation">${appreciations.length > 0 ? appreciations.join('; ') : '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="text-align: right;"><strong>Moyenne du semestre:</strong></td>
                  <td colspan="2"><strong>${moyenne1}/20</strong></td>
                </tr>
              </tfoot>
            </table>

            <h3>Deuxième semestre</h3>
            <table>
              <thead>
                <tr>
                  <th>Cours</th>
                  <th>Enseignant</th>
                  <th>Coefficient</th>
                  <th>Moyenne/20</th>
                  <th>Appréciations</th>
                </tr>
              </thead>
              <tbody>
                ${semestre2Averages.map(({ coursInfo, moyenne, enseignant, appreciations }) => `
                  <tr>
                    <td>
                      ${coursInfo.nom}<br>
                      <small>(${coursInfo.matiere_nom})</small>
                    </td>
                    <td>${enseignant ? `${enseignant.prenom} ${enseignant.nom}` : 'Non assigné'}</td>
                    <td>${coursInfo.coefficient}</td>
                    <td>${moyenne}</td>
                    <td class="appreciation">${appreciations.length > 0 ? appreciations.join('; ') : '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="text-align: right;"><strong>Moyenne du semestre:</strong></td>
                  <td colspan="2"><strong>${moyenne2}/20</strong></td>
                </tr>
              </tfoot>
            </table>

            <div class="results">
              <h3>Résultats annuels</h3>
              <p>Moyenne 1er semestre: ${moyenne1}/20</p>
              <p>Moyenne 2ème semestre: ${moyenne2}/20</p>
              <p>Moyenne annuelle: ${moyenneAnnuelle}/20</p>
            </div>
          </div>

          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #059669; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Imprimer le bulletin
            </button>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
  };

  return (
    <div className="space-y-6">
      {/* Filtres et recherche */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <select
            value={selectedClasse}
            onChange={(e) => setSelectedClasse(e.target.value)}
            className="rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
          >
            <option value="all">Toutes les classes</option>
            <option value="1">1ère année</option>
            <option value="2">2ème année</option>
            <option value="3">3ème année</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Rechercher un étudiant..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
        </div>
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
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setPreviewEtudiant(etudiant)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Aperçu
                  </button>
                  <button
                    onClick={() => handlePrint()}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimer
                  </button>
                  <button
                    onClick={() => handleDownload(etudiant)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Télécharger
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
    </div>
  );
}