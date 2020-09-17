import {getUserLocales} from 'get-user-locale';
import Languages from '../constants/Languages';

let detectedLocale: keyof typeof Languages = 'en';
let localeDetected = false;

export default function (): keyof typeof Languages {
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
      if (Object.prototype.hasOwnProperty.call(Languages, userLocale)) {
        detectedLocale = userLocale as keyof typeof Languages;
      } else if (Object.prototype.hasOwnProperty.call(Languages, userLocale.substr(0, 2))) {
        // In rare cases, user provides a locale (eg. en-US) without fallback (eg. en)
        detectedLocale = userLocale.substr(0, 2) as keyof typeof Languages;
      }
    });
  localeDetected = true;
  return detectedLocale;
}
