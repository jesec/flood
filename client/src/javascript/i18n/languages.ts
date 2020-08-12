import {addLocaleData} from 'react-intl';
import enLocaleData from 'react-intl/locale-data/en';
import csLocaleData from 'react-intl/locale-data/cs';
import deLocaleData from 'react-intl/locale-data/de';
import esLocaleData from 'react-intl/locale-data/es';
import frLocaleData from 'react-intl/locale-data/fr';
import itLocaleData from 'react-intl/locale-data/it';
import nlLocaleData from 'react-intl/locale-data/nl';
import noLocaleData from 'react-intl/locale-data/no';
import plLocaleData from 'react-intl/locale-data/pl';
import ptLocaleData from 'react-intl/locale-data/pt';
import ruLocaleData from 'react-intl/locale-data/ru';
import roLocaleData from 'react-intl/locale-data/ro';
import svLocaleData from 'react-intl/locale-data/sv';
import ukLocaleData from 'react-intl/locale-data/uk';
import koLocaleData from 'react-intl/locale-data/ko';
import jaLocaleData from 'react-intl/locale-data/ja';
import zhLocaleData from 'react-intl/locale-data/zh';
import arLocaleData from 'react-intl/locale-data/ar';

import EN from './strings';

import CS from './translations/cs';
import DE from './translations/de';
import ES from './translations/es';
import FR from './translations/fr';
import IT from './translations/it';
import NL from './translations/nl';
import NO from './translations/no';
import PL from './translations/pl';
import PT from './translations/pt';
import RU from './translations/ru';
import RO from './translations/ro';
import SV from './translations/sv';
import UK from './translations/uk';
import KO from './translations/ko';
import JA from './translations/ja';
import ZH_HANS from './translations/zh-Hans';
import ZH_HANT from './translations/zh-Hant';
import AR from './translations/ar';

addLocaleData(enLocaleData);
addLocaleData(csLocaleData);
addLocaleData(deLocaleData);
addLocaleData(esLocaleData);
addLocaleData(frLocaleData);
addLocaleData(itLocaleData);
addLocaleData(nlLocaleData);
addLocaleData(noLocaleData);
addLocaleData(plLocaleData);
addLocaleData(ptLocaleData);
addLocaleData(ruLocaleData);
addLocaleData(roLocaleData);
addLocaleData(svLocaleData);
addLocaleData(ukLocaleData);
addLocaleData(koLocaleData);
addLocaleData(jaLocaleData);
addLocaleData(zhLocaleData);
addLocaleData(arLocaleData);

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
