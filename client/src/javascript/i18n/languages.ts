import EN from './strings.json';

import CS from './translations/cs.json';
import DE from './translations/de.json';
import ES from './translations/es.json';
import FR from './translations/fr.json';
import IT from './translations/it.json';
import NL from './translations/nl.json';
import NO from './translations/no.json';
import PL from './translations/pl.json';
import PT from './translations/pt.json';
import RU from './translations/ru.json';
import RO from './translations/ro.json';
import SV from './translations/sv.json';
import UK from './translations/uk.json';
import KO from './translations/ko.json';
import JA from './translations/ja.json';
import ZH_HANS from './translations/zh-Hans.json';
import ZH_HANT from './translations/zh-Hant.json';
import AR from './translations/ar.json';

export const languages = {
  auto: EN,
  en: EN,
  cs: {
    ...EN,
    ...CS,
  },
  de: {
    ...EN,
    ...DE,
  },
  es: {
    ...EN,
    ...ES,
  },
  fr: {
    ...EN,
    ...FR,
  },
  it: {
    ...EN,
    ...IT,
  },
  nl: {
    ...EN,
    ...NL,
  },
  no: {
    ...EN,
    ...NO,
  },
  pl: {
    ...EN,
    ...PL,
  },
  pt: {
    ...EN,
    ...PT,
  },
  ru: {
    ...EN,
    ...RU,
  },
  ro: {
    ...EN,
    ...RO,
  },
  sv: {
    ...EN,
    ...SV,
  },
  uk: {
    ...EN,
    ...UK,
  },
  ko: {
    ...EN,
    ...KO,
  },
  ja: {
    ...EN,
    ...JA,
  },
  'zh-Hans': {
    ...EN,
    ...ZH_HANT,
    ...ZH_HANS,
  },
  'zh-Hant': {
    ...EN,
    ...ZH_HANS,
    ...ZH_HANT,
  },
  ar: {
    ...EN,
    ...AR,
  },
};
