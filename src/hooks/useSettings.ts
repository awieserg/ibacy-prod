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
    adresse: "BP 27 Yamoussoukro - Côte d'Ivoire",
    telephone: "(+225) 27 30 64 58 24",
    email: "ibacy05@yahoo.fr",
    siteWeb: "www.ibacy.ci"
  },
  anneeAcademique: {
    debut: "2024-09-01",
    fin: "2025-07-31"
  },
  directeurs: {
    academique: {
      nom: "Dr. HEMA Tiékoura",
      titre: "Directeur Académique"
    },
    general: {
      nom: "Rév. Dr. KOUASSI N. Bernadette epse ELLA",
      titre: "Directeur Général"
    }
  }
};

const SETTINGS_STORAGE_KEY = 'ibacy_settings';

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    } catch (error) {
      console.error('Error loading settings:', error);
      return defaultSettings;
    }
  });

  const updateSettings = (newSettings: AppSettings) => {
    try {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(newSettings));
      setSettings(newSettings);
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      return false;
    }
  };

  // Verify settings structure and fix if necessary
  useEffect(() => {
    const verifyAndFixSettings = (current: AppSettings): AppSettings => {
      const fixed = { ...defaultSettings };
      
      // Merge existing settings with defaults
      if (current.institut) {
        fixed.institut = { ...fixed.institut, ...current.institut };
      }
      if (current.anneeAcademique) {
        fixed.anneeAcademique = { ...fixed.anneeAcademique, ...current.anneeAcademique };
      }
      if (current.directeurs) {
        fixed.directeurs = {
          academique: { ...fixed.directeurs.academique, ...current.directeurs.academique },
          general: { ...fixed.directeurs.general, ...current.directeurs.general }
        };
      }
      
      return fixed;
    };

    const fixedSettings = verifyAndFixSettings(settings);
    if (JSON.stringify(fixedSettings) !== JSON.stringify(settings)) {
      updateSettings(fixedSettings);
    }
  }, []);

  return [settings, updateSettings] as const;
}
