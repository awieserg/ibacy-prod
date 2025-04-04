import { useSupabaseTable } from './useSupabase';
import type { Database } from '../types/database.types';

type Cours = Database['public']['Tables']['cours']['Row'];

export function useCours() {
  return useSupabaseTable<Cours>('cours');
}