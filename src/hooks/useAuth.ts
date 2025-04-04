import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User } from '@supabase/supabase-js';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier la session au chargement
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        switch (error.message) {
          case 'Invalid login credentials':
            throw new Error('Email ou mot de passe incorrect');
          case 'Email not confirmed':
            throw new Error('Veuillez confirmer votre email avant de vous connecter');
          default:
            throw new Error('Une erreur est survenue lors de la connexion');
        }
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        switch (error.message) {
          case 'User already registered':
            throw new Error('Un compte existe déjà avec cet email');
          case 'Password should be at least 6 characters':
            throw new Error('Le mot de passe doit contenir au moins 6 caractères');
          default:
            throw new Error("Une erreur est survenue lors de l'inscription");
        }
      }

      if (data.user) {
        const { error: profileError } = await supabase.from('users').insert({
          id: data.user.id,
          email: data.user.email,
          role: 'ADMIN',
          created_at: new Date().toISOString(),
        });

        if (profileError) {
          console.error('Error creating user profile:', profileError);
        }
      }

      return data;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw new Error('Une erreur est survenue lors de la déconnexion');
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}