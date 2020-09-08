import regEx from '@shared/util/regEx';

export const isNotEmpty = (value: string) => {
  return value != null && value !== '';
};

export const isRegExValid = (regExToCheck: string) => {
  try {
    // eslint-disable-next-line no-new
    new RegExp(regExToCheck);
  } catch (err) {
    return false;
  }

  return true;
};

export const isURLValid = (url: string) => {
  return url != null && url !== '' && url.match(regEx.url) !== null;
};

export const isPositiveInteger = (value: number | string) => {
  if (value === null || value === '') return false;

  const number = parseInt(`${value}`, 10);

  return !Number.isNaN(number) && number > 0;
};
