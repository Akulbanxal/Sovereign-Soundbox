import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { LanguageCode } from '../types/soundbox';
import { translations, type TranslationDictionary, type TranslationKey } from './translations';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
  formatRelativeTime: (timestampMs: number) => string;
  formatCfa: (amount: number) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'sovereign_lang';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as LanguageCode | null;
      if (saved && (saved === 'fr' || saved === 'wo' || saved === 'en')) {
        return saved;
      }
    } catch {
      // localStorage unavailable (e.g. private mode)
    }
    return 'fr';
  });

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // ignore
    }
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = useCallback(
    (key: TranslationKey, params?: Record<string, string | number>): string => {
      const dict: TranslationDictionary = translations[language] || translations.fr;
      let text = dict[key] || translations.fr[key] || key;

      if (params) {
        Object.entries(params).forEach(([paramKey, paramVal]) => {
          text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
        });
      }

      return text;
    },
    [language]
  );

  const formatRelativeTime = useCallback(
    (timestampMs: number): string => {
      const now = Date.now();
      const diffSec = Math.max(0, Math.floor((now - timestampMs) / 1000));

      if (diffSec < 45) {
        return t('time_just_now');
      }

      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) {
        return t('time_minutes_ago', { n: diffMin });
      }

      const diffHour = Math.floor(diffMin / 60);
      if (diffHour < 24) {
        return t('time_hours_ago', { n: diffHour });
      }

      const diffDay = Math.floor(diffHour / 24);
      return t('time_days_ago', { n: diffDay });
    },
    [t]
  );

  const formatCfa = useCallback((amount: number): string => {
    return `${amount.toLocaleString('fr-SN')} CFA`;
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        formatRelativeTime,
        formatCfa,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

