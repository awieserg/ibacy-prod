import React, { useState } from 'react';
import { NoteForm } from './NoteForm';
import { Plus, Pencil } from 'lucide-react';

interface NotesTableProps {
  etudiant: Etudiant;
  cours: Cours[];
  notes: Note[];
  onAddNote: (note: Omit<Note, "id">) => void;
  onUpdateNote: (id: string, note: Omit<Note, "id">) => void;
}

export function NotesTable({ etudiant, cours, notes, onAddNote, onUpdateNote }: NotesTableProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedCours, setSelectedCours] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<Note | null>(null);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">
          Notes de {etudiant.prenom} {etudiant.nom}
        </h3>
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
              {etudiantNotes.map((note) => {
                const coursInfo = cours.find(c => c.id === note.cours_id);
                return (
                  <tr key={note.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {coursInfo?.nom}
                        </div>
                        <div className="text-sm text-gray-500">
                          {coursInfo?.matiere_nom}
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
                      <button
                        onClick={() => {
                          setEditingNote(note);
                          setShowForm(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {etudiantNotes.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucune note enregistrée
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}