/*
  # Mise à jour des politiques de sécurité

  1. Modifications
    - Création du type enum user_role s'il n'existe pas
    - Mise à jour des politiques pour la table users
    - Mise à jour des politiques pour les tables métier
    - Mise à jour des politiques pour la table settings

  2. Sécurité
    - Restriction des accès selon les rôles utilisateur
    - Séparation des permissions lecture/écriture
*/

-- Création du type enum user_role s'il n'existe pas
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE user_role AS ENUM ('SUPER_ADMIN', 'ADMIN', 'TEACHER');
  END IF;
END $$;

-- Fonction utilitaire pour vérifier l'existence d'une table
CREATE OR REPLACE FUNCTION table_exists(tbl text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM pg_tables 
    WHERE tablename = tbl
  );
END;
$$ LANGUAGE plpgsql;

-- Mise à jour des politiques de sécurité
DO $$ 
BEGIN
  -- Users policies
  IF table_exists('users') THEN
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON users;
    
    CREATE POLICY "Users can read all profiles" ON users
      FOR SELECT USING (auth.role() = 'authenticated');

    CREATE POLICY "Users can update their own profile" ON users
      FOR UPDATE USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;

  -- Etudiants policies
  IF table_exists('etudiants') THEN
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON etudiants;
    
    CREATE POLICY "Admins can manage all students" ON etudiants
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND users.role::user_role IN ('SUPER_ADMIN', 'ADMIN')
        )
      );
  END IF;

  -- Enseignants policies
  IF table_exists('enseignants') THEN
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON enseignants;
    
    CREATE POLICY "Admins can manage all teachers" ON enseignants
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND users.role::user_role IN ('SUPER_ADMIN', 'ADMIN')
        )
      );
  END IF;

  -- Cours policies
  IF table_exists('cours') THEN
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON cours;
    
    CREATE POLICY "Admins can manage all courses" ON cours
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND users.role::user_role IN ('SUPER_ADMIN', 'ADMIN')
        )
      );
  END IF;

  -- Notes policies
  IF table_exists('notes') THEN
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON notes;
    
    CREATE POLICY "Admins can manage all grades" ON notes
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND users.role::user_role IN ('SUPER_ADMIN', 'ADMIN')
        )
      );
  END IF;

  -- Settings policies
  IF table_exists('settings') THEN
    DROP POLICY IF EXISTS "Enable all access for authenticated users" ON settings;
    
    CREATE POLICY "Admins can manage settings" ON settings
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM users
          WHERE users.id = auth.uid()
          AND users.role::user_role IN ('SUPER_ADMIN', 'ADMIN')
        )
      );

    CREATE POLICY "All users can read settings" ON settings
      FOR SELECT USING (auth.role() = 'authenticated');
  END IF;
END $$;