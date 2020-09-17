import {IntlProvider} from 'react-intl';
import React from 'react';

import type {MessageFormatElement} from 'intl-messageformat-parser';

import detectLocale from '../util/detectLocale';
import EN from './strings.compiled.json';
import Languages from '../constants/Languages';

const messagesCache: Partial<Record<
  Exclude<keyof typeof Languages, 'auto'>,
  Record<string, MessageFormatElement[]>
>> = {en: EN};

async function loadMessages(locale: Exclude<keyof typeof Languages, 'auto' | 'en'>) {
  const messages: Record<string, MessageFormatElement[]> = await import(`./compiled/${locale}.json`);
  messagesCache[locale] = messages;
  return messages;
}

function getMessages(locale: Exclude<keyof typeof Languages, 'auto'>) {
  if (messagesCache[locale]) {
    return messagesCache[locale];
  }
  // eslint-disable-next-line @typescript-eslint/no-throw-literal
  throw loadMessages(locale as Exclude<keyof typeof Languages, 'auto' | 'en'>);
}

const AsyncIntlProvider = ({locale, children}: {locale?: keyof typeof Languages; children: React.ReactNode}) => {
  let validatedLocale: Exclude<keyof typeof Languages, 'auto'>;
  if (locale == null || locale === 'auto' || !Object.prototype.hasOwnProperty.call(Languages, locale)) {
    validatedLocale = detectLocale();
  } else {
    validatedLocale = locale;
  }

  const messages = getMessages(validatedLocale);
  return (
    <IntlProvider locale={validatedLocale} messages={messages}>
      {children}
    </IntlProvider>
  );
};

export default AsyncIntlProvider;
