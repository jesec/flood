import {getUserLocales} from 'get-user-locale';
import * as i18n from '../i18n/languages';

let detectedLocale: keyof typeof i18n.languages = 'en';
let localeDetected = false;

export default function (): keyof typeof i18n.languages {
  if (localeDetected) {
    return detectedLocale;
  }
  // Reverse loop to respect language priority of user
  getUserLocales()
    .reverse()
    .forEach((userLocale): void => {
      switch (userLocale) {
        // Special handlings for languages with variants
        case 'zh':
        case 'zh-CN':
        case 'zh-SG':
        case 'zh-MY':
          userLocale = 'zh-Hans';
          break;
        case 'zh-TW':
        case 'zh-HK':
        case 'zh-MO':
          userLocale = 'zh-Hant';
          break;
        default:
          break;
      }
      if (Object.prototype.hasOwnProperty.call(i18n.languages, userLocale)) {
        detectedLocale = userLocale as keyof typeof i18n.languages;
      } else if (Object.prototype.hasOwnProperty.call(i18n.languages, userLocale.substr(0, 2))) {
        // In rare cases, user provides a locale (eg. en-US) without fallback (eg. en)
        detectedLocale = userLocale.substr(0, 2) as keyof typeof i18n.languages;
      }
    });
  localeDetected = true;
  return detectedLocale;
}
