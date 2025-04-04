import { useSupabaseTable } from './useSupabase';
import type { Database } from '../types/database.types';

type Note = Database['public']['Tables']['notes']['Row'];

export function useNotes() {
  return useSupabaseTable<Note>('notes');
}