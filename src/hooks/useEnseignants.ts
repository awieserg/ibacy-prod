import { useSupabaseTable } from './useSupabase';
import type { Database } from '../types/database.types';

type Enseignant = Database['public']['Tables']['enseignants']['Row'];

export function useEnseignants() {
  return useSupabaseTable<Enseignant>('enseignants');
}