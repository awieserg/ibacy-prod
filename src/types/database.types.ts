export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          role: string
          phone: string | null
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          phone?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
          phone?: string | null
          created_at?: string
        }
      }
      etudiants: {
        Row: {
          id: string
          nom: string
          prenom: string
          classe: string
          date_naissance: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nom: string
          prenom: string
          classe: string
          date_naissance: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nom?: string
          prenom?: string
          classe?: string
          date_naissance?: string
          created_at?: string
          updated_at?: string
        }
      }
      enseignants: {
        Row: {
          id: string
          nom: string
          prenom: string
          cours_ids: string[] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nom: string
          prenom: string
          cours_ids?: string[] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nom?: string
          prenom?: string
          cours_ids?: string[] | null
          created_at?: string
          updated_at?: string
        }
      }
      cours: {
        Row: {
          id: string
          nom: string
          description: string | null
          matiere_nom: string
          coefficient: number
          heures: number | null
          enseignant_id: string | null
          is_examen_final: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nom: string
          description?: string | null
          matiere_nom: string
          coefficient?: number
          heures?: number | null
          enseignant_id?: string | null
          is_examen_final?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nom?: string
          description?: string | null
          matiere_nom?: string
          coefficient?: number
          heures?: number | null
          enseignant_id?: string | null
          is_examen_final?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notes: {
        Row: {
          id: string
          etudiant_id: string
          cours_id: string
          valeur: number
          semestre: number
          appreciation: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          etudiant_id: string
          cours_id: string
          valeur: number
          semestre: number
          appreciation?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          etudiant_id?: string
          cours_id?: string
          valeur?: number
          semestre?: number
          appreciation?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          institut_nom: string
          institut_adresse: string
          institut_telephone: string
          institut_email: string
          institut_site_web: string | null
          annee_academique_debut: string
          annee_academique_fin: string
          directeur_academique_nom: string
          directeur_academique_titre: string
          directeur_general_nom: string
          directeur_general_titre: string
          updated_at: string
        }
        Insert: {
          id?: string
          institut_nom: string
          institut_adresse: string
          institut_telephone: string
          institut_email: string
          institut_site_web?: string | null
          annee_academique_debut: string
          annee_academique_fin: string
          directeur_academique_nom: string
          directeur_academique_titre: string
          directeur_general_nom: string
          directeur_general_titre: string
          updated_at?: string
        }
        Update: {
          id?: string
          institut_nom?: string
          institut_adresse?: string
          institut_telephone?: string
          institut_email?: string
          institut_site_web?: string | null
          annee_academique_debut?: string
          annee_academique_fin?: string
          directeur_academique_nom?: string
          directeur_academique_titre?: string
          directeur_general_nom?: string
          directeur_general_titre?: string
          updated_at?: string
        }
      }
    }
  }
}