import {getUserLocales} from 'get-user-locale';
import Languages from '../constants/Languages';

import type {Language} from '../constants/Languages';

let detectedLocale: Exclude<Language, 'auto'> = 'en';
let localeDetected = false;

function detectLocale(): Exclude<Language, 'auto'> {
  if (localeDetected) {
    return detectedLocale;
  }
  // Reverse loop to respect language priority of user
  getUserLocales()
    .reverse()
    .forEach((userLocale): void => {
      let locale = userLocale;
      switch (locale) {
        // Special handlings for languages with variants
        case 'zh':
        case 'zh-CN':
        case 'zh-SG':
        case 'zh-MY':
          locale = 'zh-Hans';
          break;
        case 'zh-TW':
        case 'zh-HK':
        case 'zh-MO':
          locale = 'zh-Hant';
          break;
        default:
          break;
      }
      if (Object.prototype.hasOwnProperty.call(Languages, locale)) {
        detectedLocale = locale as Exclude<Language, 'auto'>;
      } else if (Object.prototype.hasOwnProperty.call(Languages, locale.substr(0, 2))) {
        // In rare cases, user provides a locale (eg. en-US) without fallback (eg. en)
        detectedLocale = locale.substr(0, 2) as Exclude<Language, 'auto'>;
      }
    });
  localeDetected = true;
  return detectedLocale;
}

export default detectLocale;
