import React from 'react';
import { Users, School, BookOpen, GraduationCap, TrendingUp, Award } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';

interface DashboardProps {
  etudiants: Etudiant[];
  enseignants: Enseignant[];
  cours: Cours[];
  notes: Note[];
}

export function Dashboard({ etudiants, enseignants, cours, notes }: DashboardProps) {
  const [settings] = useSettings();

  const statsCards = [
    {
      title: "Étudiants",
      value: etudiants.length,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      title: "Enseignants",
      value: enseignants.length,
      icon: School,
      color: "bg-green-500",
    },
    {
      title: "Cours",
      value: cours.length,
      icon: BookOpen,
      color: "bg-purple-500",
    },
    {
      title: "Notes enregistrées",
      value: notes.length,
      icon: GraduationCap,
      color: "bg-yellow-500",
    },
  ];

  const getEtudiantsParClasse = () => {
    return etudiants.reduce((acc, etudiant) => {
      acc[etudiant.classe] = (acc[etudiant.classe] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  };

  const calculerMoyenneGenerale = () => {
    const moyennes = etudiants.map(etudiant => {
      const etudiantNotes = notes.filter(note => note.etudiant_id === etudiant.id);
      if (etudiantNotes.length === 0) return 0;

      let totalPoints = 0;
      let totalCoefficients = 0;

      etudiantNotes.forEach(note => {
        const coursInfo = cours.find(c => c.id === note.cours_id);
        if (coursInfo) {
          totalPoints += note.valeur * coursInfo.coefficient;
          totalCoefficients += coursInfo.coefficient;
        }
      });

      return totalCoefficients > 0 ? totalPoints / totalCoefficients : 0;
    });

    const moyenne = moyennes.reduce((a, b) => a + b, 0) / moyennes.length;
    return moyenne.toFixed(2);
  };

  const getMeilleursEtudiants = () => {
    const moyennesEtudiants = etudiants.map(etudiant => {
      const etudiantNotes = notes.filter(note => note.etudiant_id === etudiant.id);
      if (etudiantNotes.length === 0) return { etudiant, moyenne: 0 };

      let totalPoints = 0;
      let totalCoefficients = 0;

      etudiantNotes.forEach(note => {
        const coursInfo = cours.find(c => c.id === note.cours_id);
        if (coursInfo) {
          totalPoints += note.valeur * coursInfo.coefficient;
          totalCoefficients += coursInfo.coefficient;
        }
      });

      const moyenne = totalCoefficients > 0 ? totalPoints / totalCoefficients : 0;
      return { etudiant, moyenne };
    });

    return moyennesEtudiants
      .sort((a, b) => b.moyenne - a.moyenne)
      .slice(0, 5);
  };

  const etudiantsParClasse = getEtudiantsParClasse();
  const meilleursEtudiants = getMeilleursEtudiants();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Tableau de Bord</h2>
          <p className="mt-1 text-sm text-gray-500">
            Année Académique {new Date(settings.anneeAcademique.debut).getFullYear()}-{new Date(settings.anneeAcademique.fin).getFullYear()}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Dernière mise à jour</p>
          <p className="text-sm font-medium text-gray-900">{new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Statistiques générales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution des étudiants */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Distribution des Étudiants par Année
          </h3>
          <div className="space-y-4">
            {Object.entries(etudiantsParClasse).map(([classe, nombre]) => (
              <div key={classe}>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{classe}ème année</span>
                  <span className="font-medium">{nombre} étudiants</span>
                </div>
                <div className="mt-2 relative">
                  <div className="h-2 bg-gray-200 rounded-full">
                    <div
                      className="h-2 bg-green-500 rounded-full"
                      style={{
                        width: `${(nombre / etudiants.length) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Meilleurs étudiants */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Top 5 des Meilleurs Étudiants
          </h3>
          <div className="space-y-4">
            {meilleursEtudiants.map(({ etudiant, moyenne }, index) => (
              <div key={etudiant.id} className="flex items-center">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  index === 0 ? 'bg-yellow-100 text-yellow-600' :
                  index === 1 ? 'bg-gray-100 text-gray-600' :
                  index === 2 ? 'bg-orange-100 text-orange-600' :
                  'bg-green-50 text-green-600'
                }`}>
                  {index === 0 ? (
                    <Award className="w-5 h-5" />
                  ) : (
                    <span className="font-medium">{index + 1}</span>
                  )}
                </div>
                <div className="ml-4 flex-grow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {etudiant.prenom} {etudiant.nom}
                      </p>
                      <p className="text-sm text-gray-500">
                        {etudiant.classe}ème année
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{moyenne.toFixed(2)}/20</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Statistiques académiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Moyenne Générale
          </h3>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {calculerMoyenneGenerale()}/20
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Tous étudiants confondus
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Cours par Enseignant
          </h3>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">
              {(cours.length / (enseignants.length || 1)).toFixed(1)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Moyenne de cours par enseignant
            </p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Notes par Étudiant
          </h3>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {(notes.length / (etudiants.length || 1)).toFixed(1)}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Moyenne de notes par étudiant
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}