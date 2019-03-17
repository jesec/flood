import {addLocaleData} from 'react-intl';
import deLocaleData from 'react-intl/locale-data/de';
import enLocaleData from 'react-intl/locale-data/en';
import esLocaleData from 'react-intl/locale-data/es';
import frLocaleData from 'react-intl/locale-data/fr';
import koLocaleData from 'react-intl/locale-data/ko';
import nlLocaleData from 'react-intl/locale-data/nl';

addLocaleData(deLocaleData);
addLocaleData(enLocaleData);
addLocaleData(esLocaleData);
addLocaleData(frLocaleData);
addLocaleData(koLocaleData);
addLocaleData(nlLocaleData);

export {default as de} from './de';
export {default as en} from './en';
export {default as es} from './es';
export {default as fr} from './fr';
export {default as ko} from './ko';
export {default as nl} from './nl';
