import { useState, useEffect } from 'react';

export interface AppSettings {
  institut: {
    nom: string;
    adresse: string;
    telephone: string;
    email: string;
    siteWeb?: string;
    logo?: string;
  };
  anneeAcademique: {
    debut: string;
    fin: string;
  };
  directeurs: {
    academique: {
      nom: string;
      titre: string;
    };
    general: {
      nom: string;
      titre: string;
    };
  };
}

const defaultSettings: AppSettings = {
  institut: {
    nom: "Institut Biblique de l'Alliance Chrétienne de Yamoussoukro",
    adresse: "BP 63 Yamoussoukro - Côte d'Ivoire",
    telephone: "(+225) 27 30 64 66 77",
    email: "contact@ibacy.ci",
    siteWeb: "www.ibacy.ci"
  },
  anneeAcademique: {
    debut: "2024-09-01",
    fin: "2025-07-31"
  },
  directeurs: {
    academique: {
      nom: "Dr. KOUASSI Yao",
      titre: "Directeur Académique"
    },
    general: {
      nom: "Rév. Dr. GUEHI Pokou",
      titre: "Directeur Général"
    }
  }
};

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    } catch (error) {
      console.error('Error loading settings:', error);
      return defaultSettings;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('appSettings', JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }, [settings]);

  return [settings, setSettings] as const;
}