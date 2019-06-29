import {addLocaleData} from 'react-intl';
import deLocaleData from 'react-intl/locale-data/de';
import enLocaleData from 'react-intl/locale-data/en';
import esLocaleData from 'react-intl/locale-data/es';
import frLocaleData from 'react-intl/locale-data/fr';
import koLocaleData from 'react-intl/locale-data/ko';
import nlLocaleData from 'react-intl/locale-data/nl';
import zhLocaleData from 'react-intl/locale-data/zh';

addLocaleData(deLocaleData);
addLocaleData(enLocaleData);
addLocaleData(esLocaleData);
addLocaleData(frLocaleData);
addLocaleData(koLocaleData);
addLocaleData(nlLocaleData);
addLocaleData(zhLocaleData);

export {default as de} from './de';
export {default as en} from './en';
export {default as es} from './es';
export {default as fr} from './fr';
export {default as ko} from './ko';
export {default as nl} from './nl';
export {default as zh} from './zh';
