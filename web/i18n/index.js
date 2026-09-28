/* eslint-disable @typescript-eslint/no-require-imports */
// English stays in the bundle as the fallback catalog. zh-CN is the product
// default and is bundled too, so the first paint is Simplified Chinese
// without waiting on a locale chunk. Every other locale, including the
// existing Traditional Chinese catalog at zh, is fetched on demand by
// utils/localeLoader.
const en = require('./en/translation.json');
const zhCN = require('./zh-CN/translation.json');

// Fill any blank zh-CN string from English so a missing translation cannot
// render as an empty label. Translated values are left alone.
const withFallback = (catalog, fallback) => {
  const merged = { ...catalog };
  Object.entries(fallback).forEach(([key, fallbackValue]) => {
    const value = merged[key];
    if (typeof fallbackValue === 'string') {
      if (typeof value !== 'string' || value.trim() === '') {
        merged[key] = fallbackValue;
      }
      return;
    }
    merged[key] = withFallback(typeof value === 'object' && value ? value : {}, fallbackValue);
  });
  return merged;
};

const i18n = {
  translations: {
    en,
    'zh-CN': withFallback(zhCN, en),
  },
  defaultLang: 'zh-CN',
  // Browser-language detection for non-default locales is handled by
  // utils/localeLoader, which fetches the catalog before switching. The
  // library's own detector is off so an English browser does not override
  // the Simplified Chinese default before that loader runs.
  useBrowserDefault: false,
  languageDataStore: 'query',
};

module.exports = i18n;
