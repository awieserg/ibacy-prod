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
                  <th>Moyenne/20</th>
                  <th>Appréciations</th>
                </tr>
              </thead>
              <tbody>
                ${semestre1Averages.map(({ coursInfo, moyenne, appreciations }) => `
                  <tr>
                    <td>
                      ${coursInfo.nom}<br>
                      <small>(${coursInfo.matiere_nom})</small>
                    </td>
                    <td>${moyenne}</td>
                    <td class="appreciation">${appreciations.length > 0 ? appreciations.join('; ') : '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td style="text-align: right;"><strong>Moyenne du semestre:</strong></td>
                  <td colspan="2"><strong>${moyenne1}/20</strong></td>
                </tr>
              </tfoot>
            </table>

            <h3>Deuxième semestre</h3>
            <table>
              <thead>
                <tr>
                  <th>Cours</th>
                  <th>Moyenne/20</th>
                  <th>Appréciations</th>
                </tr>
              </thead>
              <tbody>
                ${semestre2Averages.map(({ coursInfo, moyenne, appreciations }) => `
                  <tr>
                    <td>
                      ${coursInfo.nom}<br>
                      <small>(${coursInfo.matiere_nom})</small>
                    </td>
                    <td>${moyenne}</td>
                    <td class="appreciation">${appreciations.length > 0 ? appreciations.join('; ') : '-'}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td style="text-align: right;"><strong>Moyenne du semestre:</strong></td>
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
      {/* Code principal de l'application */}
    </div>
  );
}
