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

export function BulletinPreview({ etudiant, cours, notes, enseignants, onClose }: BulletinPreviewProps) {
  const [bulletinType, setBulletinType] = useState<BulletinType>('semestre1');
  const [remarquesDirecteur, setRemarquesDirecteur] = useState('');
  const [settings] = useSettings();

  // Vérification des paramètres
  if (!etudiant || !cours || !notes) {
    return <div>Aucune donnée disponible pour afficher le bulletin.</div>;
  }

  if (!settings || !settings.institut || !settings.anneeAcademique) {
    return <div>Les paramètres de l'institut sont manquants.</div>;
  }

  const coursAverages = useMemo(() => {
    const semestreActuel = bulletinType === 'semestre1' ? 1 : 2;
    const notesFiltered = notes.filter(note => note.semestre === semestreActuel);
    const grouped = notesFiltered.reduce((acc, note) => {
      const coursInfo = cours.find(c => c.id === note.cours_id);
      if (!coursInfo) return acc;
      if (!acc[coursInfo.id]) {
        acc[coursInfo.id] = { notes: [], coursInfo };
      }
      acc[coursInfo.id].notes.push(note);
      return acc;
    }, {} as Record<string, { notes: Note[]; coursInfo: Cours }>);

    return Object.values(grouped).map(({ notes, coursInfo }) => {
      const totalNotes = notes.reduce((sum, note) => sum + note.valeur, 0);
      const moyenne = +(totalNotes / notes.length).toFixed(2) || 0;
      return {
        id: coursInfo.id,
        nom: coursInfo.nom,
        matiere_nom: coursInfo.matiere_nom,
        coefficient: coursInfo.coefficient,
        moyenne,
        appreciations: [getAppreciationFromGrade(moyenne)],
      };
    });
  }, [bulletinType, notes, cours]);

  const handlePrint = () => {
    const content = document.getElementById('bulletin-content');
    if (content) {
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Bulletin - ${etudiant.prenom} ${etudiant.nom}</title>
            <style>
              @page { size: A4; margin: 20mm; }
              body { font-family: Arial, sans-serif; padding: 20px; }
              table { width: 100%; border-collapse: collapse; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f8f9fa; }
              .header { text-align: center; margin-bottom: 20px; }
              .appreciation { font-style: italic; }
              @media print {
                .no-print { display: none; }
              }
            </style>
          </head>
          <body>
            ${content.outerHTML}
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div id="bulletin-content">
      <div className="header">
        <h1>{settings.institut.nom}</h1>
        <p>Bulletin de notes - Année académique {settings.anneeAcademique}</p>
      </div>
      <table>
        <thead>
          <tr>
            <th>Nom du cours</th>
            <th>Coefficient</th>
            <th>Moyenne</th>
            <th>Appréciation</th>
          </tr>
        </thead>
        <tbody>
          {coursAverages.length > 0 ? (
            coursAverages.map(cours => (
              <tr key={cours.id}>
                <td>{cours.nom}</td>
                <td>{cours.coefficient}</td>
                <td>{cours.moyenne}</td>
                <td className="appreciation">{cours.appreciations[0]}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4}>Aucune donnée disponible pour ce semestre.</td>
            </tr>
          )}
        </tbody>
      </table>
      <button onClick={handlePrint}>Imprimer</button>
    </div>
  );
}
