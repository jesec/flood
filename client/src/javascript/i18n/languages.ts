import {addLocaleData} from 'react-intl';
import deLocaleData from 'react-intl/locale-data/de';
import enLocaleData from 'react-intl/locale-data/en';
import esLocaleData from 'react-intl/locale-data/es';
import frLocaleData from 'react-intl/locale-data/fr';
import koLocaleData from 'react-intl/locale-data/ko';
import nlLocaleData from 'react-intl/locale-data/nl';
import zhLocaleData from 'react-intl/locale-data/zh';

import DE from './de';
import EN from './en';
import ES from './es';
import FR from './fr';
import KO from './ko';
import NL from './nl';
import ZH_HANS from './zh-Hans';
import ZH_HANT from './zh-Hant';

addLocaleData(deLocaleData);
addLocaleData(enLocaleData);
addLocaleData(esLocaleData);
addLocaleData(frLocaleData);
addLocaleData(koLocaleData);
addLocaleData(nlLocaleData);
addLocaleData(zhLocaleData);

export const languages = {
  de: DE,
  en: EN,
  es: ES,
  fr: FR,
  ko: KO,
  nl: NL,
  'zh-Hans': ZH_HANS,
  'zh-Hant': ZH_HANT,
};
