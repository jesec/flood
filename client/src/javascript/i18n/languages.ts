import {addLocaleData} from 'react-intl';
import deLocaleData from 'react-intl/locale-data/de';
import enLocaleData from 'react-intl/locale-data/en';
import esLocaleData from 'react-intl/locale-data/es';
import frLocaleData from 'react-intl/locale-data/fr';
import koLocaleData from 'react-intl/locale-data/ko';
import nlLocaleData from 'react-intl/locale-data/nl';
import zhLocaleData from 'react-intl/locale-data/zh';

import EN from './strings';
import ES from './translations/es';
import FR from './translations/fr';
import KO from './translations/ko';
import NL from './translations/nl';
import ZH_HANS from './translations/zh-Hans';
import ZH_HANT from './translations/zh-Hant';

addLocaleData(deLocaleData);
addLocaleData(enLocaleData);
addLocaleData(esLocaleData);
addLocaleData(frLocaleData);
addLocaleData(koLocaleData);
addLocaleData(nlLocaleData);
addLocaleData(zhLocaleData);

export const languages = {
  auto: EN,
  en: EN,
  es: {
    ...EN,
    ...ES,
  },
  fr: {
    ...EN,
    ...FR,
  },
  ko: {
    ...EN,
    ...KO,
  },
  nl: {
    ...EN,
    ...NL,
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
};
