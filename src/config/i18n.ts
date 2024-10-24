import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enJSON from '@/langs/en.json';
import idJSON from '@/langs/id.json';

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: { ...enJSON },
    },
    id: {
      translation: { ...idJSON },
    },
  },
  keySeparator: '.',
  lng: 'en',
  fallbackLng: 'en',
});
