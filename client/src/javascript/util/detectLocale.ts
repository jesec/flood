import {getUserLocales} from 'get-user-locale';

import Languages from '@client/constants/Languages';
import type {Language} from '@client/constants/Languages';

export interface LocaleConfig {
  locale: string;
  language: Exclude<Language, 'auto'>;
}

const detectedLocales: LocaleConfig = {
  locale: 'en',
  language: 'en',
};

let localeDetected = false;

const detectLocale = (): LocaleConfig => {
  if (localeDetected) {
    return detectedLocales;
  }

  // Reverse loop to respect language priority of user
  getUserLocales()
    .reverse()
    .forEach((userLocale): void => {
      detectedLocales.locale = userLocale;
      switch (detectedLocales.locale) {
        // Special handlings for languages with variants
        case 'zh':
        case 'zh-CN':
        case 'zh-SG':
        case 'zh-MY':
          detectedLocales.locale = 'zh-Hans';
          break;
        case 'zh-TW':
        case 'zh-HK':
        case 'zh-MO':
          detectedLocales.locale = 'zh-Hant';
          break;
        default:
          break;
      }
      if (Object.prototype.hasOwnProperty.call(Languages, detectedLocales.locale)) {
        detectedLocales.language = detectedLocales.locale as Exclude<Language, 'auto'>;
      } else if (Object.prototype.hasOwnProperty.call(Languages, detectedLocales.locale.substr(0, 2))) {
        // In rare cases, user provides a locale (eg. en-US) without fallback (eg. en)
        detectedLocales.language = detectedLocales.locale.substr(0, 2) as Exclude<Language, 'auto'>;
      }
    });

  localeDetected = true;
  return detectedLocales;
};

export default detectLocale;
