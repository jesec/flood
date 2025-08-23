import {url as matchURL} from '@shared/util/regEx';

export const isNotEmpty = (value: string | undefined): value is string => value != null && value !== '';

export const isRegExValid = (regExToCheck: string): boolean => {
  try {
    new RegExp(regExToCheck);
  } catch {
    return false;
  }

  return true;
};

export const isURLValid = (url: string | undefined): url is string =>
  url != null && url !== '' && url.match(matchURL) !== null;

export const isPositiveInteger = (value: number | string | undefined): boolean => {
  if (value === null || value === '') return false;

  const number = parseInt(`${value}`, 10);

  return !Number.isNaN(number) && number > 0;
};
