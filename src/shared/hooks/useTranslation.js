import { useState, useEffect } from 'react';
import en from '../../i18n/en.json';
import zhTW from '../../i18n/zh-TW.json';
import ja from '../../i18n/ja.json';
import es from '../../i18n/es.json';

const translations = {
  'en': en,
  'zh-TW': zhTW,
  'ja': ja,
  'es': es
};

export function useTranslation() {
  const [lang, setLang] = useState(localStorage.getItem('app_lang') || 'zh-TW');

  const t = (path) => {
    const keys = path.split('.');
    let value = translations[lang];
    for (const key of keys) {
      if (!value || !value[key]) return path;
      value = value[key];
    }
    return value;
  };

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('app_lang', newLang);
  };

  return { t, lang, changeLanguage };
}
