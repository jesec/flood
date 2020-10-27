const Languages = {
  auto: {
    id: 'locale.language.auto',
  },
  en: 'English',
  cs: 'Čeština',
  de: 'Deutsch',
  es: 'Español',
  fr: 'Français',
  it: 'italiano',
  hu: 'magyar nyelv',
  nl: 'Nederlands',
  no: 'norsk',
  pl: 'Polskie',
  pt: 'português',
  ru: 'русский язык',
  ro: 'Romanian',
  sv: 'svenska',
  uk: 'українська мова',
  ko: '한국어',
  ja: '日本語',
  'zh-Hans': '中文(简体)',
  'zh-Hant': '中文(繁體)',
  ar: 'اَلْعَرَبِيَّةُ',
  translate: {
    id: 'locale.language.translate',
  },
} as const;

export default Languages;
export type Language = keyof typeof Languages;
