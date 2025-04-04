import { useSupabaseTable } from './useSupabase';
import type { Database } from '../types/database.types';

type Etudiant = Database['public']['Tables']['etudiants']['Row'];

export function useEtudiants() {
  return useSupabaseTable<Etudiant>('etudiants');
}