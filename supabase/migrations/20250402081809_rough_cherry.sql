/*
  # Schéma initial de la base de données IBACY

  1. Nouvelles Tables
    - `users` : Utilisateurs/administrateurs du système (si n'existe pas déjà)
    - `etudiants` : Étudiants de l'institut
    - `enseignants` : Enseignants de l'institut
    - `cours` : Cours dispensés
    - `notes` : Notes des étudiants
    - `settings` : Paramètres de l'application

  2. Sécurité
    - RLS activé sur toutes les tables
    - Politiques permettant l'accès complet aux utilisateurs authentifiés
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (only if it doesn't exist)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'users') THEN
    CREATE TABLE users (
      id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      email text UNIQUE NOT NULL,
      full_name text,
      avatar_url text,
      role text DEFAULT 'admin',
      phone text,
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Etudiants table
CREATE TABLE IF NOT EXISTS etudiants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom text NOT NULL,
  prenom text NOT NULL,
  classe text NOT NULL,
  date_naissance date NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enseignants table
CREATE TABLE IF NOT EXISTS enseignants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom text NOT NULL,
  prenom text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cours table
CREATE TABLE IF NOT EXISTS cours (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  nom text NOT NULL,
  description text,
  matiere_nom text NOT NULL,
  coefficient integer NOT NULL DEFAULT 1,
  heures integer,
  enseignant_id uuid REFERENCES enseignants(id) ON DELETE SET NULL,
  is_examen_final boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notes table
CREATE TABLE IF NOT EXISTS notes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  etudiant_id uuid REFERENCES etudiants(id) ON DELETE CASCADE,
  cours_id uuid REFERENCES cours(id) ON DELETE CASCADE,
  valeur numeric(4,2) NOT NULL CHECK (valeur >= 0 AND valeur <= 20),
  semestre integer NOT NULL CHECK (semestre IN (1, 2)),
  appreciation text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  institut_nom text NOT NULL,
  institut_adresse text NOT NULL,
  institut_telephone text NOT NULL,
  institut_email text NOT NULL,
  institut_site_web text,
  annee_academique_debut date NOT NULL,
  annee_academique_fin date NOT NULL,
  directeur_academique_nom text NOT NULL,
  directeur_academique_titre text NOT NULL,
  directeur_general_nom text NOT NULL,
  directeur_general_titre text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

-- Insert default settings if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM settings LIMIT 1) THEN
    INSERT INTO settings (
      institut_nom,
      institut_adresse,
      institut_telephone,
      institut_email,
      institut_site_web,
      annee_academique_debut,
      annee_academique_fin,
      directeur_academique_nom,
      directeur_academique_titre,
      directeur_general_nom,
      directeur_general_titre
    ) VALUES (
      'Institut Biblique de l''Alliance Chrétienne de Yamoussoukro',
      'BP 63 Yamoussoukro - Côte d''Ivoire',
      '(+225) 27 30 64 66 77',
      'contact@ibacy.ci',
      'www.ibacy.ci',
      '2024-09-01',
      '2025-07-31',
      'Dr. KOUASSI Yao',
      'Directeur Académique',
      'Rév. Dr. GUEHI Pokou',
      'Directeur Général'
    );
  END IF;
END $$;

-- Enable Row Level Security
DO $$ 
BEGIN
  EXECUTE 'ALTER TABLE users ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE etudiants ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE enseignants ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE cours ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE notes ENABLE ROW LEVEL SECURITY';
  EXECUTE 'ALTER TABLE settings ENABLE ROW LEVEL SECURITY';
EXCEPTION
  WHEN others THEN NULL;
END $$;

-- Create policies for authenticated access
DO $$ 
BEGIN
  -- Users policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Enable all access for authenticated users') THEN
    CREATE POLICY "Enable all access for authenticated users" ON users
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;

  -- Etudiants policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'etudiants' AND policyname = 'Enable all access for authenticated users') THEN
    CREATE POLICY "Enable all access for authenticated users" ON etudiants
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;

  -- Enseignants policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'enseignants' AND policyname = 'Enable all access for authenticated users') THEN
    CREATE POLICY "Enable all access for authenticated users" ON enseignants
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;

  -- Cours policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'cours' AND policyname = 'Enable all access for authenticated users') THEN
    CREATE POLICY "Enable all access for authenticated users" ON cours
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;

  -- Notes policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'notes' AND policyname = 'Enable all access for authenticated users') THEN
    CREATE POLICY "Enable all access for authenticated users" ON notes
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;

  -- Settings policies
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'settings' AND policyname = 'Enable all access for authenticated users') THEN
    CREATE POLICY "Enable all access for authenticated users" ON settings
      FOR ALL USING (auth.role() = 'authenticated');
  END IF;
END $$;

-- Create updated_at triggers function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers if not exist
DO $$
BEGIN
  -- Etudiants trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_etudiants_updated_at') THEN
    CREATE TRIGGER update_etudiants_updated_at
        BEFORE UPDATE ON etudiants
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();
  END IF;

  -- Enseignants trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_enseignants_updated_at') THEN
    CREATE TRIGGER update_enseignants_updated_at
        BEFORE UPDATE ON enseignants
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();
  END IF;

  -- Cours trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_cours_updated_at') THEN
    CREATE TRIGGER update_cours_updated_at
        BEFORE UPDATE ON cours
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();
  END IF;

  -- Notes trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_notes_updated_at') THEN
    CREATE TRIGGER update_notes_updated_at
        BEFORE UPDATE ON notes
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();
  END IF;

  -- Settings trigger
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_settings_updated_at') THEN
    CREATE TRIGGER update_settings_updated_at
        BEFORE UPDATE ON settings
        FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();
  END IF;
END $$;