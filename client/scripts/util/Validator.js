import regEx from '../../../shared/util/regEx';

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
    return url != null && url.match(regEx.url) !== null;
  }
}
