/*
  # Add coursIds column to enseignants table

  1. Changes
    - Add coursIds column to enseignants table to store course assignments
    - Update existing RLS policies to handle the new column

  2. Security
    - No changes to existing RLS policies needed
    - Column inherits existing table-level security
*/

-- Add coursIds column to enseignants table
ALTER TABLE enseignants 
ADD COLUMN IF NOT EXISTS cours_ids text[] DEFAULT '{}';

-- Create an index on the cours_ids column for better query performance
CREATE INDEX IF NOT EXISTS idx_enseignants_cours_ids ON enseignants USING GIN (cours_ids);

-- Comment on column
COMMENT ON COLUMN enseignants.cours_ids IS 'Array of course IDs that this teacher is assigned to teach';