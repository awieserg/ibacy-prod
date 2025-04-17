import React, { useState, useEffect } from 'react';
import { NoteForm } from './NoteForm';
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface NotesTableProps {
  etudiant: Etudiant;
  cours: Cours[];
  notes: Note[];
  onAddNote: (note: Omit<Note, "id">) => void;
  onUpdateNote: (id: string, note: Omit<Note, "id">) => void;
  onDeleteNote: (id: string) => void;
}

export function NotesTable({ etudiant, cours, notes, onAddNote, onUpdateNote, onDeleteNote }: NotesTableProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedCours, setSelectedCours] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [debug, setDebug] = useState<{ total: number; filtered: number }>({ total: 0, filtered: 0 });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  // Effect to log debugging information
  useEffect(() => {
    const etudiantNotes = notes.filter(note => note.etudiant_id === etudiant.id);
    console.log('NotesTable Debug:', {
      etudiantId: etudiant.id,
      totalNotes: notes.length,
      filteredNotes: etudiantNotes.length,
      notesData: etudiantNotes,
      coursData: cours
    });
    setDebug({ total: notes.length, filtered: etudiantNotes.length });
  }, [notes, etudiant.id, cours]);

  const etudiantNotes = notes.filter(note => note.etudiant_id === etudiant.id);

  const handleSubmit = (noteData: Omit<Note, "id">) => {
    if (editingNote) {
      onUpdateNote(editingNote.id, noteData);
    } else {
      onAddNote(noteData);
    }
    setShowForm(false);
    setEditingNote(null);
    setSelectedCours(null);
  };

  const handleDelete = (noteId: string) => {
    setShowDeleteConfirm(noteId);
  };

  const confirmDelete = (noteId: string) => {
    onDeleteNote(noteId);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">
            Notes de {etudiant.prenom} {etudiant.nom}
          </h3>
          <p className="text-sm text-gray-500">
            {debug.filtered} note(s) sur un total de {debug.total}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingNote(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter une note
        </button>
      </div>

      {showForm && !editingNote && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Sélectionner un cours</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {cours.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setSelectedCours(c.id);
                }}
                className={`p-4 rounded-lg border text-left transition-colors ${
                  selectedCours === c.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                }`}
              >
                <h5 className="font-medium">{c.nom}</h5>
                <p className="text-sm text-gray-500">{c.matiere_nom}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {(showForm && selectedCours) || editingNote ? (
        <div className="bg-white p-6 rounded-lg shadow">
          <NoteForm
            etudiant_id={etudiant.id}
            cours_id={editingNote?.cours_id || selectedCours || ''}
            onSubmit={handleSubmit}
            initialData={editingNote || undefined}
          />
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cours
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Note
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Semestre
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Appréciation
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {etudiantNotes.length > 0 ? (
                etudiantNotes.map((note) => {
                  const coursInfo = cours.find(c => c.id === note.cours_id);
                  if (!coursInfo) {
                    console.warn(`Course not found for note: ${note.id}, cours_id: ${note.cours_id}`);
                    return null;
                  }
                  return (
                    <tr key={note.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {coursInfo.nom}
                          </div>
                          <div className="text-sm text-gray-500">
                            {coursInfo.matiere_nom}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {note.valeur}/20
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {note.semestre === 1 ? '1er semestre' : '2ème semestre'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {note.appreciation || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => {
                              setEditingNote(note);
                              setShowForm(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                            title="Modifier"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(note.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucune note enregistrée pour cet étudiant
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Êtes-vous sûr de vouloir supprimer cette note ? Cette action est irréversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Annuler
              </button>
              <button
                onClick={() => confirmDelete(showDeleteConfirm)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
