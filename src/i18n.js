import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Importa tus traducciones
import translationEN from './locales/en/translation.json';
import translationES from './locales/es/translation.json';
import translationDE from './locales/de/translation.json';

const resources = {
  en: { translation: translationEN },
  es: { translation: translationES },
  de: { translation: translationDE },
};

i18n
  .use(initReactI18next) // Passa i18next al middleware de react-i18next
  .init({
    resources,
    lng: 'es', // Idioma por defecto
    fallbackLng: 'en', // Idioma de respaldo
    interpolation: {
      escapeValue: false, // React ya protege contra XSS
    },
  });

export default i18n;