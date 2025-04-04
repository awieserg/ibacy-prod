/*
  # Make date_naissance nullable in etudiants table

  1. Changes
    - Modify date_naissance column in etudiants table to allow NULL values
    - Keep existing data intact

  2. Security
    - No changes to existing RLS policies
*/

-- Make date_naissance column nullable
ALTER TABLE etudiants 
ALTER COLUMN date_naissance DROP NOT NULL;