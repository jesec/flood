import {FC, ReactNode} from 'react';
import {IntlProvider} from 'react-intl';

import type {MessageFormatElement} from 'intl-messageformat-parser';

import detectLocale from '@client/util/detectLocale';
import Languages from '@client/constants/Languages';

import type {Language} from '@client/constants/Languages';
import type {LocaleConfig} from '@client/util/detectLocale';

import EN from './strings.compiled.json';

const messagesCache: Partial<Record<Exclude<Language, 'auto'>, Record<string, MessageFormatElement[]>>> = {en: EN};

async function loadMessages(locale: Exclude<Language, 'auto'>) {
  const messages: Record<string, MessageFormatElement[]> = await import(
    /* webpackChunkName: 'i18n' */
    `./compiled/${locale}.json`
  );

  messagesCache[locale] = messages;

  return messages;
}

function getMessages(locale: Exclude<Language, 'auto'>) {
  if (messagesCache[locale]) {
    return messagesCache[locale];
  }

  // eslint-disable-next-line @typescript-eslint/no-throw-literal
  throw loadMessages(locale as Exclude<Language, 'auto' | 'en'>);
}

interface AsyncIntlProviderProps {
  language?: Language;
  children: ReactNode;
}

const AsyncIntlProvider: FC<AsyncIntlProviderProps> = ({language, children}: AsyncIntlProviderProps) => {
  let validatedLocale: LocaleConfig;
  if (language == null || language === 'auto' || !Object.prototype.hasOwnProperty.call(Languages, language)) {
    validatedLocale = detectLocale();
  } else {
    validatedLocale = {
      locale: language,
      language,
    };
  }

  const messages = getMessages(validatedLocale.language);
  return (
    <IntlProvider locale={validatedLocale.language} messages={messages}>
      {children}
    </IntlProvider>
  );
};

AsyncIntlProvider.defaultProps = {
  language: 'en',
};

export default AsyncIntlProvider;
