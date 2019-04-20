import regEx from 'universally-shared-code/util/regEx';

export default class Validator {
  static isNotEmpty(value) {
    return value != null && value !== '';
  }

  static isRegExValid(regEx) {
    try {
      new RegExp(regEx);
    } catch (err) {
      return false;
    }

    return true;
  }

  static isURLValid(url) {
    return url != null && url !== '' && url.match(regEx.url) !== null;
  }

  static isPositiveInteger(value) {
    if (value === null || value === '') return false;

    let number = parseInt(value, 10);

    return !isNaN(number) && number > 0;
  }
}
