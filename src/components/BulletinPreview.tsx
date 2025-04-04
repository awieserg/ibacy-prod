import React, { useState, useMemo } from 'react';
import { X, Printer } from 'lucide-react';
import type { BulletinType } from '../types';
import { useSettings } from '../hooks/useSettings';

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

  // Calculer les moyennes par cours
  const coursAverages = useMemo(() => {
    const semestreActuel = bulletinType === 'semestre1' ? 1 : 2;
    const notesFiltered = etudiantNotes.filter(note => {
      const coursInfo = cours.find(c => c.id === note.cours_id);
      return note.semestre === semestreActuel && 
             (bulletinType === 'final' ? coursInfo?.is_examen_final : !coursInfo?.is_examen_final);
    });

    // Grouper les notes par cours
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

    // Calculer la moyenne pour chaque cours
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
        appreciations: notes.map(note => note.appreciation).filter((app): app is string => !!app)
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

  const getAppreciationGenerale = (moyenne: number) => {
    if (moyenne >= 16) return 'Excellent';
    if (moyenne >= 14) return 'Très Bien';
    if (moyenne >= 12) return 'Bien';
    if (moyenne >= 10) return 'Assez Bien';
    return 'Insuffisant';
  };

  const handlePrint = () => {
    window.print();
  };

  const getAnneeAcademique = () => {
    const debut = new Date(settings.anneeAcademique.debut);
    const fin = new Date(settings.anneeAcademique.fin);
    return `${debut.getFullYear()}-${fin.getFullYear()}`;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full p-8 max-h-[90vh] overflow-y-auto" id="bulletin-content">
        {/* Type de bulletin */}
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

        {/* En-tête */}
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

        {/* Informations de l'étudiant */}
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

        {/* Relevé de notes */}
        <div className="mb-8">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cours</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enseignant</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Coef</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Moyenne/20</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Appréciations</th>
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
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {cours.enseignant}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-gray-500">
                    {cours.coefficient}
                  </td>
                  <td className="px-4 py-3 text-center font-medium">
                    {cours.moyenne}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600 italic">
                    {cours.appreciations.length > 0 
                      ? cours.appreciations.join('; ')
                      : '-'
                    }
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
                  {getAppreciationGenerale(moyenneGenerale)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Remarques du Directeur Académique */}
        <div className="mb-8">
          <h4 className="text-lg font-medium mb-3">Remarques du {settings.directeurs.academique.titre}</h4>
          <textarea
            value={remarquesDirecteur}
            onChange={(e) => setRemarquesDirecteur(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-md print:border-none print:p-0"
            rows={3}
            placeholder="Ajouter des remarques..."
          />
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 mt-12 print:mt-16">
          <div className="text-center">
            <p className="font-medium">{settings.directeurs.academique.titre}</p>
            <p className="mt-1">{settings.directeurs.academique.nom}</p>
            <div className="mt-8 h-16 border-b border-gray-300">
              {/* Espace pour la signature */}
            </div>
          </div>
          <div className="text-center">
            <p className="font-medium">{settings.directeurs.general.titre}</p>
            <p className="mt-1">{settings.directeurs.general.nom}</p>
            <div className="mt-8 h-16 border-b border-gray-300">
              {/* Espace pour la signature */}
            </div>
          </div>
        </div>

        {/* Bouton d'impression */}
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