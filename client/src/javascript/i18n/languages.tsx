import {FC, ReactNode, useEffect} from 'react';
import {i18n} from '@lingui/core';
import {I18nProvider} from '@lingui/react';
import {observer} from 'mobx-react';
import * as plurals from 'make-plural/plurals';

import detectLocale from '@client/util/detectLocale';
import Languages from '@client/constants/Languages';
import SettingStore from '@client/stores/SettingStore';

import type {Language} from '@client/constants/Languages';
import type {LocaleConfig} from '@client/util/detectLocale';

// eslint-disable-next-line import/no-webpack-loader-syntax
import {messages as EN} from '@lingui/loader!./strings/en.json';

const messagesCache: Partial<Record<Exclude<Language, 'auto'>, Record<string, string[]>>> = {en: EN};

i18n.loadLocaleData('en', {plurals: plurals.en});
i18n.load('en', messagesCache.en as Record<string, string[]>);
i18n.activate('en');

async function loadMessages(locale: Exclude<Language, 'auto'>) {
  const {messages} = await import(
    /* webpackChunkName: 'i18n' */
    `@lingui/loader!./strings/${locale}.json`
  );

  messagesCache[locale] = messages;

  return messages;
}

async function getMessages(locale: Exclude<Language, 'auto'>): Promise<Record<string, string[]>> {
  const cached = messagesCache[locale];
  if (cached != null) {
    return cached;
  }

  return loadMessages(locale as Exclude<Language, 'auto' | 'en'>);
}

interface AsyncIntlProviderProps {
  children: ReactNode;
}

const AsyncIntlProvider: FC<AsyncIntlProviderProps> = observer(({children}: AsyncIntlProviderProps) => {
  const {language} = SettingStore.floodSettings;

  useEffect(() => {
    let validatedLocale: LocaleConfig;
    if (language == null || language === 'auto' || !Object.prototype.hasOwnProperty.call(Languages, language)) {
      validatedLocale = detectLocale();
    } else {
      validatedLocale = {
        locale: language,
        language,
      };
    }

    (async () => {
      if (validatedLocale.language === 'zh-Hans' || validatedLocale.language === 'zh-Hant') {
        i18n.loadLocaleData(validatedLocale.locale, {plurals: plurals.zh});
      } else {
        i18n.loadLocaleData(validatedLocale.locale, {plurals: plurals[validatedLocale.language]});
      }
      i18n.load(validatedLocale.locale, {...EN, ...(await getMessages(validatedLocale.language))});
      i18n.activate(validatedLocale.locale);
    })();
  }, [language]);

  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
});

export default AsyncIntlProvider;
