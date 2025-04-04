/*
  # Add missing columns to users table

  1. Changes
    - Add avatar_url column to users table
    - Add full_name column to users table
    - Add phone column to users table

  2. Security
    - No changes to existing RLS policies
*/

-- Add missing columns to users table if they don't exist
DO $$ 
BEGIN
  -- Add avatar_url column
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'avatar_url'
  ) THEN
    ALTER TABLE users ADD COLUMN avatar_url text;
  END IF;

  -- Add full_name column
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'full_name'
  ) THEN
    ALTER TABLE users ADD COLUMN full_name text;
  END IF;

  -- Add phone column
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'phone'
  ) THEN
    ALTER TABLE users ADD COLUMN phone text;
  END IF;
END $$;