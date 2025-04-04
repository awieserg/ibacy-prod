import React, { useState } from 'react';
import { School, Users, BookOpen, GraduationCap, Menu, X, Plus, Settings, User, Home } from 'lucide-react';
import { useAuthContext } from './components/AuthProvider';
import { useSettings } from './hooks/useSettings';
import { useEtudiants } from './hooks/useEtudiants';
import { useEnseignants } from './hooks/useEnseignants';
import { useCours } from './hooks/useCours';
import { useNotes } from './hooks/useNotes';
import { EtudiantForm } from './components/EtudiantForm';
import { EtudiantList } from './components/EtudiantList';
import { EnseignantForm } from './components/EnseignantForm';
import { EnseignantList } from './components/EnseignantList';
import { CoursForm } from './components/CoursForm';
import { CoursList } from './components/CoursList';
import { BulletinList } from './components/BulletinList';
import { NotesTable } from './components/NotesTable';
import { Parametres } from './components/Parametres';
import { UserProfile } from './components/UserProfile';
import { Dashboard } from './components/Dashboard';
import { LoginForm } from './components/LoginForm';

function App() {
  const { user } = useAuthContext();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<{ id: string; type: 'etudiant' | 'enseignant' | 'cours' } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedEtudiantId, setSelectedEtudiantId] = useState<string | null>(null);
  const [settings, setSettings] = useSettings();
  const [showUserProfile, setShowUserProfile] = useState(false);

  // Remplacer les useLocalStorage par les hooks Supabase
  const {
    data: etudiants,
    loading: loadingEtudiants,
    insert: insertEtudiant,
    update: updateEtudiant,
    remove: removeEtudiant
  } = useEtudiants();

  const {
    data: enseignants,
    loading: loadingEnseignants,
    insert: insertEnseignant,
    update: updateEnseignant,
    remove: removeEnseignant
  } = useEnseignants();

  const {
    data: cours,
    loading: loadingCours,
    insert: insertCours,
    update: updateCours,
    remove: removeCours
  } = useCours();

  const {
    data: notes,
    loading: loadingNotes,
    insert: insertNote,
    update: updateNote
  } = useNotes();

  // Si l'utilisateur n'est pas connecté, afficher le formulaire de connexion
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
        <LoginForm />
      </div>
    );
  }

  // Afficher un indicateur de chargement pendant le chargement des données
  if (loadingEtudiants || loadingEnseignants || loadingCours || loadingNotes) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-sm text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  const handleAddEtudiant = async (newEtudiant: Omit<Etudiant, "id">) => {
    try {
      if (editingItem?.type === 'etudiant') {
        await updateEtudiant(editingItem.id, newEtudiant);
        setEditingItem(null);
      } else {
        await insertEtudiant(newEtudiant);
      }
      setShowForm(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout/modification de l\'étudiant:', error);
    }
  };

  const handleAddEnseignant = async (newEnseignant: Omit<Enseignant, "id">) => {
    try {
      if (editingItem?.type === 'enseignant') {
        await updateEnseignant(editingItem.id, newEnseignant);
        setEditingItem(null);
      } else {
        await insertEnseignant(newEnseignant);
      }
      setShowForm(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout/modification de l\'enseignant:', error);
    }
  };

  const handleAddCours = async (newCours: Omit<Cours, "id">) => {
    try {
      if (editingItem?.type === 'cours') {
        await updateCours(editingItem.id, newCours);
        setEditingItem(null);
      } else {
        await insertCours(newCours);
      }
      setShowForm(false);
    } catch (error) {
      console.error('Erreur lors de l\'ajout/modification du cours:', error);
    }
  };

  const handleAddNote = async (newNote: Omit<Note, "id">) => {
    try {
      await insertNote(newNote);
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la note:', error);
    }
  };

  const handleUpdateNote = async (id: string, updatedNote: Omit<Note, "id">) => {
    try {
      await updateNote(id, updatedNote);
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la note:', error);
    }
  };

  const handleEdit = (id: string, type: 'etudiant' | 'enseignant' | 'cours') => {
    setEditingItem({ id, type });
    setShowForm(true);
  };

  const handleDeleteEtudiant = async (id: string) => {
    try {
      await removeEtudiant(id);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'étudiant:', error);
    }
  };

  const handleDeleteEnseignant = async (id: string) => {
    try {
      await removeEnseignant(id);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'enseignant:', error);
    }
  };

  const handleDeleteCours = async (id: string) => {
    try {
      await removeCours(id);
    } catch (error) {
      console.error('Erreur lors de la suppression du cours:', error);
    }
  };

  const getInitialData = () => {
    if (!editingItem) return undefined;
    
    switch (editingItem.type) {
      case 'etudiant':
        return etudiants.find(e => e.id === editingItem.id);
      case 'enseignant':
        return enseignants.find(e => e.id === editingItem.id);
      case 'cours':
        return cours.find(c => c.id === editingItem.id);
      default:
        return undefined;
    }
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Home },
    { id: 'etudiants', label: 'Étudiants', icon: Users },
    { id: 'enseignants', label: 'Enseignants', icon: School },
    { id: 'cours', label: 'Cours', icon: BookOpen },
    { id: 'bulletins', label: 'Bulletins', icon: GraduationCap },
  ];

  const selectedEtudiant = selectedEtudiantId ? etudiants.find(e => e.id === selectedEtudiantId) : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <header className="bg-green-700 text-white shadow-lg fixed top-0 left-0 right-0 z-10">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md hover:bg-green-600 transition-colors"
            >
              {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
            <div className="ml-4">
              <div className="flex items-baseline">
                <h1 className="text-3xl font-bold tracking-tight">IBACY</h1>
                <span className="ml-2 text-green-100">|</span>
                <span className="ml-2 text-lg text-green-100">Gestion Académique</span>
              </div>
              <p className="text-sm text-green-100 mt-0.5">Institut Biblique de l'Alliance Chrétienne de Yamoussoukro</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowUserProfile(!showUserProfile)}
              className="flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-green-600 transition-colors"
            >
              <User className="w-5 h-5" />
              <span className="hidden sm:inline">Mon Profil</span>
            </button>
          </div>
        </div>
      </header>

      {/* Barre latérale */}
      <aside className={`fixed left-0 top-[73px] bottom-0 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <nav className="p-4 h-full flex flex-col">
          <ul className="space-y-2 flex-grow">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveTab(item.id);
                      if (item.id !== 'etudiants') {
                        setSelectedEtudiantId(null);
                      }
                    }}
                    className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-green-50 text-green-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-green-600'
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
          
          {/* Boutons du bas */}
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <button
              onClick={() => setActiveTab('parametres')}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                activeTab === 'parametres'
                  ? 'bg-green-50 text-green-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-green-600'
              }`}
            >
              <Settings className="w-5 h-5 mr-3" />
              Paramètres
            </button>
          </div>
        </nav>
      </aside>

      {/* Contenu principal */}
      <main className={`pt-[73px] transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-0'}`}>
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            {activeTab === 'dashboard' && (
              <Dashboard
                etudiants={etudiants}
                enseignants={enseignants}
                cours={cours}
                notes={notes}
              />
            )}

            {activeTab === 'etudiants' && !selectedEtudiantId && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">Gestion des Étudiants</h2>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setShowForm(!showForm);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un étudiant
                  </button>
                </div>
                
                {showForm && (
                  <div className="mb-6">
                    <EtudiantForm 
                      onSubmit={handleAddEtudiant}
                      initialData={editingItem?.type === 'etudiant' ? getInitialData() as Etudiant : undefined}
                    />
                  </div>
                )}

                <EtudiantList 
                  etudiants={etudiants}
                  onDelete={handleDeleteEtudiant}
                  onEdit={(id) => handleEdit(id, 'etudiant')}
                  onSelectEtudiant={setSelectedEtudiantId}
                />
              </div>
            )}

            {activeTab === 'etudiants' && selectedEtudiantId && selectedEtudiant && (
              <div>
                <button
                  onClick={() => setSelectedEtudiantId(null)}
                  className="mb-6 text-sm text-gray-600 hover:text-gray-900 flex items-center"
                >
                  ← Retour à la liste
                </button>
                <NotesTable
                  etudiant={selectedEtudiant}
                  cours={cours}
                  notes={notes}
                  onAddNote={handleAddNote}
                  onUpdateNote={handleUpdateNote}
                />
              </div>
            )}

            {activeTab === 'enseignants' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">Gestion des Enseignants</h2>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setShowForm(!showForm);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un enseignant
                  </button>
                </div>

                {showForm && (
                  <div className="mb-6">
                    <EnseignantForm 
                      onSubmit={handleAddEnseignant}
                      initialData={editingItem?.type === 'enseignant' ? getInitialData() as Enseignant : undefined}
                      cours={cours}
                    />
                  </div>
                )}

                <EnseignantList
                  enseignants={enseignants}
                  cours={cours}
                  onDelete={handleDeleteEnseignant}
                  onEdit={(id) => handleEdit(id, 'enseignant')}
                />
              </div>
            )}

            {activeTab === 'cours' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">Gestion des Cours</h2>
                  <button
                    onClick={() => {
                      setEditingItem(null);
                      setShowForm(!showForm);
                    }}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Ajouter un cours
                  </button>
                </div>

                {showForm && (
                  <div className="mb-6">
                    <CoursForm 
                      onSubmit={handleAddCours}
                      enseignants={enseignants}
                      cours={cours}
                      initialData={editingItem?.type === 'cours' ? getInitialData() as Cours : undefined}
                    />
                  </div>
                )}

                <CoursList
                  cours={cours}
                  enseignants={enseignants}
                  onDelete={handleDeleteCours}
                  onEdit={(id) => handleEdit(id, 'cours')}
                />
              </div>
            )}

            {activeTab === 'bulletins' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">Édition des Bulletins</h2>
                </div>
                <BulletinList 
                  etudiants={etudiants}
                  cours={cours}
                  enseignants={enseignants}
                  notes={notes}
                />
              </div>
            )}

            {activeTab === 'parametres' && (
              <Parametres
                onSave={setSettings}
                initialSettings={settings}
              />
            )}
          </div>
        </div>
      </main>

      {/* Modal du profil utilisateur */}
      {showUserProfile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-md w-full mx-4">
            <UserProfile onClose={() => setShowUserProfile(false)} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;