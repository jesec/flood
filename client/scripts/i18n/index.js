import {addLocaleData, IntlProvider} from 'react-intl';
import deLocaleData from 'react-intl/locale-data/de';
import enLocaleData from 'react-intl/locale-data/en';
import nlLocaleData from 'react-intl/locale-data/nl';

addLocaleData(deLocaleData);
addLocaleData(enLocaleData);
addLocaleData(nlLocaleData);

export { default as de } from './de';
export { default as nl } from './nl';
