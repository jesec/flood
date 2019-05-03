import regEx from 'universally-shared-code/util/regEx';

export default class Validator {
  isNotEmpty(value) {
    return value != null && value !== '';
  }

  isRegExValid(regExToCheck) {
    try {
      // eslint-disable-next-line no-new
      new RegExp(regExToCheck);
    } catch (err) {
      return false;
    }

    return true;
  }

  isURLValid(url) {
    return url != null && url !== '' && url.match(regEx.url) !== null;
  }

  isPositiveInteger(value) {
    if (value === null || value === '') return false;

    const number = parseInt(value, 10);

    return !Number.isNaN(number) && number > 0;
  }
}
