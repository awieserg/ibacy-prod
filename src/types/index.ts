export interface Etudiant {
  id: string;
  nom: string;
  prenom: string;
  classe: string;
  date_naissance: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Enseignant {
  id: string;
  nom: string;
  prenom: string;
  cours_ids?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface Cours {
  id: string;
  nom: string;
  description: string;
  matiere_nom: string;
  coefficient: number;
  heures?: number;
  enseignant_id: string | null;
  is_examen_final?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Note {
  id: string;
  etudiant_id: string;
  cours_id: string;
  valeur: number;
  semestre: 1 | 2;
  appreciation?: string;
  created_at?: string;
  updated_at?: string;
}

export type BulletinType = 'semestre1' | 'semestre2' | 'final';