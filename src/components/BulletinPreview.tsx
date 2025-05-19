import React, { useState, useMemo, useRef } from 'react';
import { X, School, User, Calendar, Phone, Mail, MapPin, Printer } from 'lucide-react';
import type { BulletinType } from '../types';
import { useSettings } from '../hooks/useSettings';
import { getAppreciationFromGrade } from '../utils/gradeUtils';
import { useReactToPrint } from 'react-to-print';
import logo from '../assets/Logo.png';

const MATIERE_ORDER = [
  'Ancien Testament',
  'Nouveau Testament',
  'Théologie Pratique',
  'Histoire et Théologie',
  'Sciences Humaines'
];

interface BulletinPreviewProps {
  etudiant: Etudiant;
  cours: Cours[];
  notes: Note[];
  enseignants: Enseignant[];
  onClose: () => void;
  printMode?: boolean;
}

export function BulletinPreview({ etudiant, cours, notes, enseignants, onClose, printMode = false }: BulletinPreviewProps) {
  const [bulletinType, setBulletinType] = useState<BulletinType>('semestre1');
  const [remarquesDirecteur, setRemarquesDirecteur] = useState('');
  const [remarquesConduite, setRemarquesConduite] = useState('');
  const [settings, _, loading] = useSettings();
  const componentRef = useRef(null);

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: `Bulletin_${etudiant.nom}_${etudiant.prenom}`,
    onAfterPrint: () => console.log('Impression terminée'),
  });

  const etudiantNotes = notes.filter(note => note.etudiant_id === etudiant.id);

  // Calculer les moyennes par semestre
  const moyennesParSemestre = useMemo(() => {
    const moyennes = {
      semestre1: 0,
      semestre2: 0,
      annuelle: 0
    };

    const notesS1 = etudiantNotes.filter(note => note.semestre === 1);
    const notesS2 = etudiantNotes.filter(note => note.semestre === 2);

    if (notesS1.length > 0) {
      moyennes.semestre1 = +(notesS1.reduce((sum, note) => sum + note.valeur, 0) / notesS1.length).toFixed(2);
    }

    if (notesS2.length > 0) {
      moyennes.semestre2 = +(notesS2.reduce((sum, note) => sum + note.valeur, 0) / notesS2.length).toFixed(2);
    }

    if (moyennes.semestre1 > 0 || moyennes.semestre2 > 0) {
      const diviseur = (moyennes.semestre1 > 0 ? 1 : 0) + (moyennes.semestre2 > 0 ? 1 : 0);
      moyennes.annuelle = +((moyennes.semestre1 + moyennes.semestre2) / diviseur).toFixed(2);
    }

    return moyennes;
  }, [etudiantNotes]);

  const coursParMatiere = useMemo(() => {
    const semestreActuel = bulletinType === 'semestre1' ? 1 : 2;
    const notesFiltered = etudiantNotes.filter(note => {
      const coursInfo = cours.find(c => c.id === note.cours_id);
      return note.semestre === semestreActuel && 
             (bulletinType === 'final' ? coursInfo?.is_examen_final : !coursInfo?.is_examen_final);
    });

    const matieres = new Map<string, { nom: string; cours: { id: string; nom: string; moyenne: number; appreciation: string }[] }>();

    cours.forEach(coursItem => {
      if (!matieres.has(coursItem.matiere_nom)) {
        matieres.set(coursItem.matiere_nom, {
          nom: coursItem.matiere_nom,
          cours: []
        });
      }

      const notesCours = notesFiltered.filter(note => note.cours_id === coursItem.id);
      if (notesCours.length > 0) {
        const moyenne = notesCours.reduce((sum, note) => sum + note.valeur, 0) / notesCours.length;
        matieres.get(coursItem.matiere_nom)?.cours.push({
          id: coursItem.id,
          nom: coursItem.nom,
          moyenne: +moyenne.toFixed(2),
          appreciation: getAppreciationFromGrade(moyenne)
        });
      }
    });

    // Convertir la Map en tableau et trier selon l'ordre défini
    return Array.from(matieres.values())
      .filter(matiere => matiere.cours.length > 0)
      .sort((a, b) => {
        const indexA = MATIERE_ORDER.indexOf(a.nom);
        const indexB = MATIERE_ORDER.indexOf(b.nom);
        
        // Si les deux matières ne sont pas dans l'ordre défini, les trier alphabétiquement
        if (indexA === -1 && indexB === -1) {
          return a.nom.localeCompare(b.nom);
        }
        
        // Si une matière est dans l'ordre défini et l'autre non
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        
        // Si les deux matières sont dans l'ordre défini
        return indexA - indexB;
      });
  }, [etudiantNotes, cours, bulletinType]);

  const moyenneGenerale = useMemo(() => {
    const tousLesCours = coursParMatiere.flatMap(matiere => matiere.cours);
    if (tousLesCours.length === 0) return 0;
    const totalPoints = tousLesCours.reduce((sum, cours) => sum + cours.moyenne, 0);
    return +(totalPoints / tousLesCours.length).toFixed(2);
  }, [coursParMatiere]);

  const getAnneeAcademique = () => {
    const currentYear = new Date().getFullYear();
    const debut = settings?.annee_academique_debut 
      ? new Date(settings.annee_academique_debut).getFullYear()
      : currentYear;
    const fin = settings?.annee_academique_fin
      ? new Date(settings.annee_academique_fin).getFullYear()
      : currentYear + 1;
    return `${debut}-${fin}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
      </div>
    );
  }

  const content = (
    <div ref={componentRef}>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <img src={logo} alt="Logo IBACY" className="logo-print h-32 w-auto object-contain" />
          <div className="flex-1 text-center">
            <h2 className="text-2xl font-bold text-green-700">{settings.institut_nom}</h2>
            <p className="text-gray-600 mt-2">{settings.institut_adresse} | Tél: {settings.institut_telephone}</p>
            <h3 className="text-xl font-bold mt-4">
              {bulletinType === 'final' 
                ? 'RELEVÉ DE NOTES - EXAMEN FINAL'
                : `BULLETIN DE NOTES - ${bulletinType === 'semestre1' ? '1er' : '2ème'} SEMESTRE`
              }
            </h3>
            <p className="text-gray-600">Année Académique {getAnneeAcademique()}</p>
          </div>
        </div>
      </div>

      <div className="mb-6 border-t border-b border-gray-200 py-4">
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

      <div className="mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Matières</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Cours</th>
              <th className="px-4 py-3 text-center text-xs font-bold text-gray-900 uppercase tracking-wider">Moyenne/20</th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-900 uppercase tracking-wider">Appréciation</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {coursParMatiere.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  Aucune note enregistrée pour cette période
                </td>
              </tr>
            ) : (
              coursParMatiere.map((matiere) => (
                matiere.cours.map((cours, index) => (
                  <tr key={cours.id}>
                    {index === 0 && (
                      <td className="px-4 py-3 align-top" rowSpan={matiere.cours.length}>
                        <div className="font-medium text-gray-900">{matiere.nom}</div>
                      </td>
                    )}
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{cours.nom}</div>
                    </td>
                    <td className="px-4 py-3 text-center font-medium">
                      {cours.moyenne}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 italic">
                      {cours.appreciation}
                    </td>
                  </tr>
                ))
              ))
            )}
          </tbody>
          <tfoot className="bg-gray-50">
            <tr>
              <td colSpan={2} className="px-4 py-3 text-right font-bold text-gray-900">
                Moyenne du semestre:
              </td>
              <td className="px-4 py-3 text-center font-bold text-gray-900">
                {moyenneGenerale}/20
              </td>
              <td className="px-4 py-3 font-bold text-gray-900">
                {getAppreciationFromGrade(moyenneGenerale)}
              </td>
            </tr>
            {bulletinType === 'semestre2' && (
              <>
                <tr>
                  <td colSpan={2} className="px-4 py-3 text-right font-bold text-gray-900">
                    Moyenne du 1er semestre:
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-gray-900">
                    {moyennesParSemestre.semestre1}/20
                  </td>
                  <td className="px-4 py-3 font-bold text-gray-900">
                    {getAppreciationFromGrade(moyennesParSemestre.semestre1)}
                  </td>
                </tr>
                <tr className="bg-green-50">
                  <td colSpan={2} className="px-4 py-3 text-right font-bold text-green-700">
                    Moyenne annuelle:
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-green-700">
                    {moyennesParSemestre.annuelle}/20
                  </td>
                  <td className="px-4 py-3 font-bold text-green-700">
                    {getAppreciationFromGrade(moyennesParSemestre.annuelle)}
                  </td>
                </tr>
              </>
            )}
          </tfoot>
        </table>
      </div>

      <div className="mb-2">
        <h4 className="text-sm font-medium mb-1">CONDUITE</h4>
        <textarea
          value={remarquesConduite}
          onChange={(e) => setRemarquesConduite(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md text-sm"
          rows={1}
          placeholder=".../20   Commentaire:....."
          readOnly={printMode}
        />
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium mb-1">Remarques du {settings.directeur_academique_titre}</h4>
        <textarea
          value={remarquesDirecteur}
          onChange={(e) => setRemarquesDirecteur(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md text-sm"
          rows={1}
          placeholder="..."
          readOnly={printMode}
        />
      </div>

      <div className="grid grid-cols-2 gap-8 mt-8">
        <div className="text-center">
          <p className="font-medium">{settings.directeur_academique_titre}</p>
          <p className="mt-1">{settings.directeur_academique_nom}</p>
        </div>
        <div className="text-center">
          <p className="font-medium">{settings.directeur_general_titre}</p>
          <p className="mt-1">{settings.directeur_general_nom}</p>
        </div>
      </div>
    </div>
  );

  if (printMode) {
    return content;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-end mb-4">
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

        {content}

        <div className="mt-8 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Fermer
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Imprimer le bulletin
          </button>
        </div>
      </div>
    </div>
  );
}
