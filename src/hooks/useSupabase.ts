import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../components/AuthProvider';

// Hook générique pour gérer les opérations CRUD
export function useSupabaseTable<T extends { id: string }>(tableName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthContext();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: result, error: fetchError } = await supabase
        .from(tableName)
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error(`Error fetching ${tableName}:`, fetchError);
        throw new Error(`Erreur lors de la récupération des données: ${fetchError.message}`);
      }

      setData(result as T[]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      console.error(`Error in fetchData for ${tableName}:`, err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const insert = async (item: Omit<T, 'id'>) => {
    try {
      setError(null);

      // Verify Supabase connection
      const { error: connectionError } = await supabase.from(tableName).select().limit(1);
      if (connectionError) {
        console.error('Supabase connection error:', connectionError);
        throw new Error('Erreur de connexion à la base de données');
      }

      const { data: result, error: insertError } = await supabase
        .from(tableName)
        .insert([item])
        .select()
        .single();

      if (insertError) {
        console.error(`Error inserting into ${tableName}:`, insertError);
        throw new Error(`Erreur lors de l'ajout: ${insertError.message}`);
      }

      if (!result) {
        throw new Error('Aucune donnée retournée après l\'insertion');
      }

      setData(prev => [result as T, ...prev]);
      return result as T;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de l\'ajout';
      console.error(`Error in insert for ${tableName}:`, err);
      setError(errorMessage);
      throw err;
    }
  };

  const update = async (id: string, updates: Partial<T>) => {
    try {
      setError(null);

      const { data: result, error: updateError } = await supabase
        .from(tableName)
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) {
        console.error(`Error updating ${tableName}:`, updateError);
        throw new Error(`Erreur lors de la mise à jour: ${updateError.message}`);
      }

      if (!result) {
        throw new Error('Aucune donnée retournée après la mise à jour');
      }

      setData(prev => prev.map(item => item.id === id ? (result as T) : item));
      return result as T;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de la mise à jour';
      console.error(`Error in update for ${tableName}:`, err);
      setError(errorMessage);
      throw err;
    }
  };

  const remove = async (id: string) => {
    try {
      setError(null);

      const { error: deleteError } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);

      if (deleteError) {
        console.error(`Error deleting from ${tableName}:`, deleteError);
        throw new Error(`Erreur lors de la suppression: ${deleteError.message}`);
      }

      setData(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de la suppression';
      console.error(`Error in remove for ${tableName}:`, err);
      setError(errorMessage);
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    insert,
    update,
    remove,
    refresh: fetchData
  };
}