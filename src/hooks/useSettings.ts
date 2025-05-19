import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuthContext } from '../components/AuthProvider';
import type { Database } from '../types/database.types';

type Settings = Database['public']['Tables']['settings']['Row'];

const defaultSettings: Omit<Settings, 'id' | 'updated_at'> = {
  institut_nom: "Institut Biblique de l'Alliance Chrétienne de Yamoussoukro",
  institut_adresse: "BP 27 Yamoussoukro - Côte d'Ivoire",
  institut_telephone: "(+225) 27 30 64 58 24",
  institut_email: "ibacy05@yahoo.fr",
  institut_site_web: "www.ibacy.ci",
  annee_academique_debut: "2024-09-01",
  annee_academique_fin: "2025-07-31",
  directeur_academique_nom: "Dr. HEMA Tiékoura",
  directeur_academique_titre: "Directeur Académique",
  directeur_general_nom: "Rév. Dr. KOUASSI N. Bernadette epse ELLA",
  directeur_general_titre: "Directeur Général"
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthContext();

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('settings')
        .select('*')
        .single();

      if (error) {
        console.error('Erreur lors de la récupération des paramètres:', error);
        // Si aucun paramètre n'existe, créer les paramètres par défaut
        if (error.code === 'PGRST116') {
          const { data: newSettings, error: insertError } = await supabase
            .from('settings')
            .insert([defaultSettings])
            .select()
            .single();

          if (insertError) {
            throw insertError;
          }

          setSettings(newSettings);
          return;
        }
        throw error;
      }

      setSettings(data);
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: Omit<Settings, 'id' | 'updated_at'>) => {
    try {
      if (!settings?.id) {
        const { data, error } = await supabase
          .from('settings')
          .insert([newSettings])
          .select()
          .single();

        if (error) throw error;
        setSettings(data);
        return true;
      }

      const { data, error } = await supabase
        .from('settings')
        .update(newSettings)
        .eq('id', settings.id)
        .select()
        .single();

      if (error) throw error;
      setSettings(data);
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      return false;
    }
  };

  return [settings || defaultSettings, updateSettings, loading] as const;
}
