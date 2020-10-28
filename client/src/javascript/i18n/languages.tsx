import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import {IntlProvider} from 'react-intl';
import React from 'react';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/en';

import type {MessageFormatElement} from 'intl-messageformat-parser';

import detectLocale from '../util/detectLocale';
import EN from './strings.compiled.json';
import Languages from '../constants/Languages';

import type {Language} from '../constants/Languages';

let dayjsLocale: Exclude<Language, 'auto' | 'zh-Hans' | 'zh-Hant'> | 'zh-cn' | 'zh-tw' = 'en';

const messagesCache: Partial<Record<Exclude<Language, 'auto'>, Record<string, MessageFormatElement[]>>> = {en: EN};

const inContextTranslator = document.createElement('script');
inContextTranslator.src = '//cdn.crowdin.com/jipt/jipt.js';

function loadTranslator() {
  if (!document.head.contains(inContextTranslator)) {
    document.head.appendChild(inContextTranslator);
  }
}

async function loadMessages(locale: Exclude<Language, 'auto'>) {
  const messages: Record<string, MessageFormatElement[]> = await import(
    /* webpackChunkName: 'i18n' */
    `./compiled/${locale === 'translate' ? 'en' : locale}.json`
  );
  messagesCache[locale] = messages;

  if (locale !== 'translate') {
    await import(/* webpackChunkName: 'i18n' */ `dayjs/locale/${dayjsLocale}.js`);
  }

  return messages;
}

function getMessages(locale: Exclude<Language, 'auto'>) {
  if (locale === 'zh-Hans') {
    dayjsLocale = 'zh-cn';
  } else if (locale === 'zh-Hant') {
    dayjsLocale = 'zh-tw';
  } else if (locale === 'translate') {
    loadTranslator();
    dayjsLocale = 'en';
  } else {
    dayjsLocale = locale;
  }

  if (messagesCache[locale]) {
    return messagesCache[locale];
  }

  // eslint-disable-next-line @typescript-eslint/no-throw-literal
  throw loadMessages(locale as Exclude<Language, 'auto' | 'en'>);
}

interface AsyncIntlProviderProps {
  locale?: Language;
  children: React.ReactNode;
}

const AsyncIntlProvider: React.FC<AsyncIntlProviderProps> = ({locale, children}: AsyncIntlProviderProps) => {
  let validatedLocale: Exclude<Language, 'auto'>;
  if (locale == null || locale === 'auto' || !Object.prototype.hasOwnProperty.call(Languages, locale)) {
    validatedLocale = detectLocale();
  } else {
    validatedLocale = locale;
  }

  const messages = getMessages(validatedLocale);
  return (
    <IntlProvider locale={validatedLocale === 'translate' ? 'en' : validatedLocale} messages={messages}>
      {children}
    </IntlProvider>
  );
};

AsyncIntlProvider.defaultProps = {
  locale: 'en',
};

dayjs.extend(duration);
dayjs.extend(relativeTime);

export const minToHumanReadable = (min: number) => {
  try {
    return dayjs
      .duration(min * 60 * 1000)
      .locale(dayjsLocale)
      .humanize(false);
  } catch {
    try {
      return dayjs
        .duration(min * 60 * 1000)
        .locale('en')
        .humanize(false);
    } catch {
      return `${min}`;
    }
  }
};

export default AsyncIntlProvider;
