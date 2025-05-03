import React, { useState, useMemo } from 'react';
import { X, Printer } from 'lucide-react';
import type { BulletinType } from '../types';
import { useSettings } from '../hooks/useSettings';
import { getAppreciationFromGrade } from '../utils/gradeUtils';

interface BulletinPreviewProps {
  etudiant: Etudiant;
  cours: Cours[];
  notes: Note[];
  enseignants: Enseignant[];
  onClose: () => void;
}

interface CoursAverage {
  id: string;
  nom: string;
  matiere_nom: string;
  coefficient: number;
  enseignant: string;
  moyenne: number;
  appreciations: string[];
}

interface ClassStats {
  moyenne: number;
  plusForte: number;
  plusFaible: number;
}

export function BulletinPreview({ etudiant, cours, notes, enseignants, onClose }: BulletinPreviewProps) {
  const [bulletinType, setBulletinType] = useState<BulletinType>('semestre1');
  const [remarquesDirecteur, setRemarquesDirecteur] = useState('');
  const [settings] = useSettings();

  const etudiantNotes = notes.filter(note => note.etudiant_id === etudiant.id);
  
  const getEnseignantNom = (enseignant_id: string | null) => {
    if (!enseignant_id) return 'Non assigné';
    const enseignant = enseignants.find(e => e.id === enseignant_id);
    return enseignant ? `${enseignant.prenom} ${enseignant.nom}` : 'Non assigné';
  };

  const coursAverages = useMemo(() => {
    const semestreActuel = bulletinType === 'semestre1' ? 1 : 2;
    const notesFiltered = etudiantNotes.filter(note => {
      const coursInfo = cours.find(c => c.id === note.cours_id);
      return note.semestre === semestreActuel && 
             (bulletinType === 'final' ? coursInfo?.is_examen_final : !coursInfo?.is_examen_final);
    });

    const notesByCours = notesFiltered.reduce((acc, note) => {
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

    return Object.values(notesByCours).map(({ notes, coursInfo }) => {
      const totalNotes = notes.reduce((sum, note) => sum + note.valeur, 0);
      const moyenne = notes.length > 0 ? totalNotes / notes.length : 0;

      return {
        id: coursInfo.id,
        nom: coursInfo.nom,
        matiere_nom: coursInfo.matiere_nom,
        coefficient: coursInfo.coefficient,
        enseignant: getEnseignantNom(coursInfo.enseignant_id),
        moyenne: +moyenne.toFixed(2),
        appreciations: [getAppreciationFromGrade(moyenne)]
      };
    }).sort((a, b) => a.matiere_nom.localeCompare(b.matiere_nom));
  }, [etudiantNotes, cours, bulletinType, enseignants]);

  const moyenneGenerale = useMemo(() => {
    if (coursAverages.length === 0) return 0;

    let totalPoints = 0;
    let totalCoefficients = 0;

    coursAverages.forEach(cours => {
      totalPoints += cours.moyenne * cours.coefficient;
      totalCoefficients += cours.coefficient;
    });

    return totalCoefficients > 0 ? +(totalPoints / totalCoefficients).toFixed(2) : 0;
  }, [coursAverages]);

  const classStats = useMemo(() => {
    const semestreActuel = bulletinType === 'semestre1' ? 1 : 2;
    const moyennesParEtudiant = new Map<string, number>();

    // Calculer la moyenne pour chaque étudiant
    notes.forEach(note => {
      if (note.semestre !== semestreActuel) return;
      const coursInfo = cours.find(c => c.id === note.cours_id);
      if (!coursInfo) return;
      if (bulletinType === 'final' ? !coursInfo.is_examen_final : coursInfo.is_examen_final) return;

      const etudiantMoyenne = moyennesParEtudiant.get(note.etudiant_id) || { total: 0, coef: 0 };
      etudiantMoyenne.total += note.valeur * coursInfo.coefficient;
      etudiantMoyenne.coef += coursInfo.coefficient;
      moyennesParEtudiant.set(note.etudiant_id, etudiantMoyenne);
    });

    // Calculer les statistiques
    const moyennes = Array.from(moyennesParEtudiant.values())
      .map(({ total, coef }) => coef > 0 ? total / coef : 0)
      .filter(m => m > 0);

    if (moyennes.length === 0) {
      return { moyenne: 0, plusForte: 0, plusFaible: 0 };
    }

    return {
      moyenne: +(moyennes.reduce((a, b) => a + b, 0) / moyennes.length).toFixed(2),
      plusForte: +Math.max(...moyennes).toFixed(2),
      plusFaible: +Math.min(...moyennes).toFixed(2)
    };
  }, [notes, cours, bulletinType]);

  const handlePrint = () => {
    const printContent = document.getElementById('bulletin-content');
    if (printContent) {
      const originalDisplay = document.body.style.display;
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Bulletin - ${etudiant.prenom} ${etudiant.nom}</title>
            <style>
              @page {
                size: A4;
                margin: 10mm;
              }
              body {
                font-family: Arial, sans-serif;
                font-size: 11pt;
                line-height: 1.3;
                margin: 0;
                padding: 0;
              }
              h1 { font-size: 16pt; margin: 0 0 4pt 0; }
              h2 { font-size: 14pt; margin: 0 0 4pt 0; }
              h3 { font-size: 12pt; margin: 0 0 4pt 0; }
              p { margin: 0 0 4pt 0; }
              table {
                width: 100%;
                border-collapse: collapse;
                margin: 8pt 0;
                font-size: 10pt;
              }
              th, td {
                border: 1px solid #000;
                padding: 4pt;
                text-align: left;
              }
              th { background-color: #f0f0f0; }
              .header {
                text-align: center;
                margin-bottom: 12pt;
              }
              .student-info {
                margin-bottom: 12pt;
              }
              .appreciation { font-style: italic; }
              .signatures {
                display: flex;
                justify-content: space-between;
                margin-top: 16pt;
              }
              .signature {
                text-align: center;
                width: 45%;
              }
              .signature-line {
                margin-top: 24pt;
                border-top: 1px solid #000;
                width: 100%;
              }
              .small { font-size: 9pt; }
              .stats {
                display: flex;
                justify-content: space-between;
                margin: 12pt 0;
                padding: 8pt;
                background-color: #f8f9fa;
                border: 1px solid #dee2e6;
                border-radius: 4px;
              }
              .stat-item {
                text-align: center;
              }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>${settings.institut.nom}</h1>
              <p>${settings.institut.adresse} • Tél: ${settings.institut.telephone}</p>
              <h2>${bulletinType === 'final' ? 'RELEVÉ DE NOTES - EXAMEN FINAL' : 
                    `BULLETIN DE NOTES - ${bulletinType === 'semestre1' ? '1er' : '2ème'} SEMESTRE`}</h2>
              <p>Année Académique ${new Date(settings.anneeAcademique.debut).getFullYear()}-${new Date(settings.anneeAcademique.fin).getFullYear()}</p>
            </div>

            <div class="student-info">
              <p><strong>Nom et Prénoms:</strong> ${etudiant.prenom} ${etudiant.nom} • <strong>Classe:</strong> ${etudiant.classe}ème année</p>
            </div>

            <table>
              <thead>
                <tr>
                  <th width="30%">Cours</th>
                  <th width="25%">Enseignant</th>
                  <th width="10%">Coef</th>
                  <th width="15%">Moyenne/20</th>
                  <th width="20%">Appréciation</th>
                </tr>
              </thead>
              <tbody>
                ${coursAverages.map(cours => `
                  <tr>
                    <td>
                      ${cours.nom}
                      <span class="small"><br>(${cours.matiere_nom})</span>
                    </td>
                    <td>${cours.enseignant}</td>
                    <td style="text-align: center">${cours.coefficient}</td>
                    <td style="text-align: center">${cours.moyenne}</td>
                    <td class="appreciation">${cours.appreciations[0]}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="3" style="text-align: right"><strong>Moyenne générale:</strong></td>
                  <td style="text-align: center"><strong>${moyenneGenerale}/20</strong></td>
                  <td class="appreciation"><strong>${getAppreciationFromGrade(moyenneGenerale)}</strong></td>
                </tr>
              </tfoot>
            </table>

            <div class="stats">
              <div class="stat-item">
                <strong>Moyenne de la classe:</strong><br>
                ${classStats.moyenne}/20
              </div>
              <div class="stat-item">
                <strong>Plus forte moyenne:</strong><br>
                ${classStats.plusForte}/20
              </div>
              <div class="stat-item">
                <strong>Plus faible moyenne:</strong><br>
                ${classStats.plusFaible}/20
              </div>
            </div>

            <div style="margin-top: 12pt">
              <h3>Remarques du ${settings.directeurs.academique.titre}</h3>
              <p>${remarquesDirecteur || 'Aucune remarque'}</p>
            </div>

            <div class="signatures">
              <div class="signature">
                <p><strong>${settings.directeurs.academique.titre}</strong></p>
                <p>${settings.directeurs.academique.nom}</p>
                <div class="signature-line"></div>
              </div>
              <div class="signature">
                <p><strong>${settings.directeurs.general.titre}</strong></p>
                <p>${settings.directeurs.general.nom}</p>
                <div class="signature-line"></div>
              </div>
            </div>
          </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();

      document.body.style.display = originalDisplay;
    }
  };

  const getAnneeAcademique = () => {
    const debut = new Date(settings.anneeAcademique.debut);
    const fin = new Date(settings.anneeAcademique.fin);
    return `${debut.getFullYear()}-${fin.getFullYear()}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full p-8 max-h-[90vh] overflow-y-auto" id="bulletin-content">
        <div className="flex justify-end mb-4 print:hidden">
          <div className="inline-flex rounded-md shadow-sm">
            <button
              onClick={() => setBulletinType('semestre1')}
              className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                bulletinType === 'semestre1'
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              1er Semestre
            </button>
            <button
              onClick={() => setBulletinType('semestre2')}
              className={`px-4 py-2 text-sm font-medium border-t border-b ${
                bulletinType === 'semestre2'
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              2ème Semestre
            </button>
            <button
              onClick={() => setBulletinType('final')}
              className={`px-4 py-2 text-sm font-medium rounded-r-md border ${
                bulletinType === 'final'
                  ? 'bg-green-600 text-white border-green-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Examen Final
            </button>
          </div>
        </div>

        <div className="flex justify-between items-start mb-8">
          <div className="text-center flex-1">
            <h2 className="text-2xl font-bold text-green-700">{settings.institut.nom}</h2>
            <p className="text-lg font-semibold">IBACY - Yamoussoukro</p>
            <p className="text-gray-600 mt-2">{settings.institut.adresse}</p>
            <p className="text-gray-600">Tél: {settings.institut.telephone}</p>
            <h3 className="text-xl font-bold mt-4">
              {bulletinType === 'final' 
                ? 'RELEVÉ DE NOTES - EXAMEN FINAL'
                : `BULLETIN DE NOTES - ${bulletinType === 'semestre1' ? '1er' : '2ème'} SEMESTRE`
              }
            </h3>
            <p className="text-gray-600">Année Académique {getAnneeAcademique()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full print:hidden"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        <div className="mb-8 border-t border-b border-gray-200 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-600">Nom et Prénoms:</p>
              <p className="font-medium text-lg">{etudiant.prenom} {etudiant.nom}</p>
            </div>
            <div>
              <p className="text-gray-600">Classe:</p>
              <p className="font-medium text-lg">{etudiant.classe}ème année</p>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cours</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Moyenne/20</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appréciation</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coursAverages.map((cours) => (
                <tr key={cours.id}>
                  <td className="px-4 py-3">
                    <div>
                      <div className="font-medium text-gray-900">{cours.nom}</div>
                      <div className="text-sm text-gray-500">({cours.matiere_nom})</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center font-medium">
                    {cours.moyenne}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 italic">
                    {cours.appreciations[0]}
                  </td>
                </tr>
              ))}
              {coursAverages.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    Aucune note enregistrée pour cette période
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-right font-medium">
                  {bulletinType === 'final' ? 'Moyenne finale:' : 'Moyenne du semestre:'}
                </td>
                <td className="px-4 py-3 text-center font-bold">
                  {moyenneGenerale}/20
                </td>
                <td className="px-4 py-3 font-medium text-gray-700">
                  {getAppreciationFromGrade(moyenneGenerale)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mb-6 bg-gray-50 p-4 rounded-lg grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-600">Moyenne de la classe</p>
            <p className="text-xl font-semibold text-gray-900">{classStats.moyenne}/20</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Plus forte moyenne</p>
            <p className="text-xl font-semibold text-green-600">{classStats.plusForte}/20</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Plus faible moyenne</p>
            <p className="text-xl font-semibold text-red-600">{classStats.plusFaible}/20</p>
          </div>
        </div>

        <div className="mb-8">
          <h4 className="text-lg font-medium mb-3">Remarques du {settings.directeurs.academique.titre}</h4>
          <textarea
            value={remarquesDirecteur}
            onChange={(e) => setRemarquesDirecteur(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md print:border-none print:p-0"
            rows={2}
            placeholder="Ajouter des remarques..."
          />
        </div>

        <div className="grid grid-cols-2 gap-8 mt-8 print:mt-12">
          <div className="text-center">
            <p className="font-medium">{settings.directeurs.academique.titre}</p>
            <p className="mt-1">{settings.directeurs.academique.nom}</p>
            <div className="mt-8 h-12 border-b border-gray-300">
            </div>
          </div>
          <div className="text-center">
            <p className="font-medium">{settings.directeurs.general.titre}</p>
            <p className="mt-1">{settings.directeurs.general.nom}</p>
            <div className="mt-8 h-12 border-b border-gray-300">
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-end print:hidden">
          <button
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
          >
            <Printer className="w-4 h-4 mr-2" />
            Imprimer le bulletin
          </button>
        </div>
      </div>
    </div>
  );
}
