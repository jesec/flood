/**
 * @class DateFormatter
 * The DateFormatter supports decoding from and encoding to
 * ISO8601 formatted strings. Accepts formats with and without
 * hyphen/colon separators and correctly parses zoning info.
 */
var DateFormatter = function (opts) {
  this.opts = {}
  this.setOpts(opts)
}

/**
 * Default options for DateFormatter
 * @static
 * @see DateFormatter#setOpts
 */
DateFormatter.DEFAULT_OPTIONS = {
  colons: true
, hyphens: false
, local: true
, ms: false
, offset: false
}

/**
 * Regular Expression that disects ISO 8601 formatted strings into
 * an array of parts.
 * @static
 */
DateFormatter.ISO8601 = new RegExp(
  '([0-9]{4})([-]?([0-9]{2}))([-]?([0-9]{2}))'
+ '(T([0-9]{2})(((:?([0-9]{2}))?((:?([0-9]{2}))?(\.([0-9]+))?))?)'
+ '(Z|([+-]([0-9]{2}(:?([0-9]{2}))?)))?)?'
)

/**
 * Sets options for encoding Date objects to ISO8601 strings.
 *    Omitting the 'opts' argument will reset all options to the default.
 *
 * @param {Object} opts - Options (optional)
 * @param {Boolean} opts.colons  - Enable/disable formatting the time portion
 *                                 with a colon as separator (default: true)
 * @param {Boolean} opts.hyphens - Enable/disable formatting the date portion
 *                                 with a hyphen as separator (default: false)
 * @param {Boolean} opts.local   - Encode as local time instead of UTC
 *                                 (default: true)
 * @param {Boolean} opts.ms      - Enable/Disable output of milliseconds
 *                                 (default: false)
 * @param {Boolean} opts.offset  - Enable/Disable output of UTC offset
 *                                 (default: false)
 */
DateFormatter.prototype.setOpts = function (opts) {
  if (!opts) opts = DateFormatter.DEFAULT_OPTIONS

  var ctx = this;
  Object.keys(DateFormatter.DEFAULT_OPTIONS).forEach(function (k) {
    ctx.opts[k] = opts.hasOwnProperty(k) ?
      opts[k] : DateFormatter.DEFAULT_OPTIONS[k]
  })
}

/**
 * Converts a date time stamp following the ISO8601 format to a JavaScript Date
 * object.
 *
 * @param {String} time - String representation of timestamp.
 * @return {Date}       - Date object from timestamp.
 */
DateFormatter.prototype.decodeIso8601 = function(time) {
  var dateParts = time.toString().match(DateFormatter.ISO8601)
  if (!dateParts) {
    throw new Error('Expected a ISO8601 datetime but got \'' + time + '\'')
  }

  var date = [
    [dateParts[1], dateParts[3] || '01', dateParts[5] || '01'].join('-')
    , 'T'
    , [
        dateParts[7] || '00'
      , dateParts[11] || '00'
      , dateParts[14] || '00'
      ].join(':')
    , '.'
    , dateParts[16] || '000'
  ].join('')

  date += (dateParts[17] !== undefined) ?
    dateParts[17] +
      ((dateParts[19] && dateParts[20] === undefined) ? '00' : '') :
    DateFormatter.formatCurrentOffset(new Date(date))

  return new Date(date)
}

/**
 * Converts a JavaScript Date object to an ISO8601 timestamp.
 *
 * @param {Date} date - Date object.
 * @return {String}   - String representation of timestamp.
 */
DateFormatter.prototype.encodeIso8601 = function(date) {
  var parts = this.opts.local ?
    DateFormatter.getLocalDateParts(date) :
    DateFormatter.getUTCDateParts(date)

  return [
    [parts[0],parts[1],parts[2]].join(this.opts.hyphens ? '-' : '')
  , 'T'
  , [parts[3],parts[4],parts[5]].join(this.opts.colons ? ':' : '')
  , (this.opts.ms) ? '.' + parts[6] : ''
  , (this.opts.local) ? ((this.opts.offset) ?
      DateFormatter.formatCurrentOffset(date) : '') : 'Z'
  ].join('')
}

/**
 * Helper function to get an array of zero-padded date parts,
 * in UTC
 *
 * @param {Date} date - Date Object
 * @return {String[]}
 */
DateFormatter.getUTCDateParts = function (date) {
  return [
    date.getUTCFullYear()
  , DateFormatter.zeroPad(date.getUTCMonth()+1,2)
  , DateFormatter.zeroPad(date.getUTCDate(),2)
  , DateFormatter.zeroPad(date.getUTCHours(), 2)
  , DateFormatter.zeroPad(date.getUTCMinutes(), 2)
  , DateFormatter.zeroPad(date.getUTCSeconds(), 2)
  , DateFormatter.zeroPad(date.getUTCMilliseconds(), 3)]
}


/**
 * Helper function to get an array of zero-padded date parts,
 * in the local time zone
 *
 * @param {Date} date - Date Object
 * @return {String[]}
 */
DateFormatter.getLocalDateParts = function (date) {
  return [
    date.getFullYear()
  , DateFormatter.zeroPad(date.getMonth()+1,2)
  , DateFormatter.zeroPad(date.getDate(),2)
  , DateFormatter.zeroPad(date.getHours(), 2)
  , DateFormatter.zeroPad(date.getMinutes(), 2)
  , DateFormatter.zeroPad(date.getSeconds(), 2)
  , DateFormatter.zeroPad(date.getMilliseconds(), 3)]
}

/**
 * Helper function to pad the digits with 0s to meet date formatting
 * requirements.
 *
 * @param {Number} digit  - The number to pad.
 * @param {Number} length - Length of digit string, prefix with 0s if not
 *                          already length.
 * @return {String}       - String with the padded digit
 */
DateFormatter.zeroPad = function (digit, length) {
  var padded = '' + digit
  while (padded.length < length) {
    padded = '0' + padded
  }

  return padded
}

/**
 * Helper function to get the current timezone to default decoding to
 * rather than UTC. (for backward compatibility)
 *
 * @return {String} - in the format /Z|[+-]\d{2}:\d{2}/
 */
DateFormatter.formatCurrentOffset = function (d) {
  var offset = (d || new Date()).getTimezoneOffset()
  return (offset === 0) ? 'Z' : [
      (offset < 0) ? '+' : '-'
    , DateFormatter.zeroPad(Math.abs(Math.floor(offset/60)),2)
    , ':'
    , DateFormatter.zeroPad(Math.abs(offset%60),2)
  ].join('')
}

// export an instance of DateFormatter only.
module.exports = new DateFormatter()
