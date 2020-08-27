import EN from './compiled/strings.json';

import CS from './compiled/cs.json';
import DE from './compiled/de.json';
import ES from './compiled/es.json';
import FR from './compiled/fr.json';
import IT from './compiled/it.json';
import HU from './compiled/hu.json';
import NL from './compiled/nl.json';
import NO from './compiled/no.json';
import PL from './compiled/pl.json';
import PT from './compiled/pt.json';
import RU from './compiled/ru.json';
import RO from './compiled/ro.json';
import SV from './compiled/sv.json';
import UK from './compiled/uk.json';
import KO from './compiled/ko.json';
import JA from './compiled/ja.json';
import ZH_HANS from './compiled/zh-Hans.json';
import ZH_HANT from './compiled/zh-Hant.json';
import AR from './compiled/ar.json';

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
  hu: {
    ...EN,
    ...HU,
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
