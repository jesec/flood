export function compute(bytes, precision = 2) {
  const kilobyte = 1024;

  const megabyte = kilobyte * 1024;

  const gigabyte = megabyte * 1024;

  const terabyte = gigabyte * 1024;
  let value = 0;

  let unit = '';

  if (bytes >= terabyte) {
    value = bytes / terabyte;
    unit = 'TB';
  } else if (bytes >= gigabyte) {
    value = bytes / gigabyte;
    unit = 'GB';
  } else if (bytes >= megabyte) {
    value = bytes / megabyte;
    unit = 'MB';
  } else if (bytes >= kilobyte) {
    value = bytes / kilobyte;
    unit = 'kB';
  } else {
    value = bytes;
    unit = 'B';
  }

  value = Number(value);
  if (!!value && value >= 100) {
    value = Math.floor(value);
  } else if (!!value && value > 10) {
    value = Number(value.toFixed(precision - 1));
  } else if (value) {
    value = Number(value.toFixed(precision));
  }

  return {
    value,
    unit,
  };
}

export function getTranslationString(unit) {
  const UNIT_TO_STRING_ID = {
    B: 'unit.size.byte',
    kB: 'unit.size.kilobyte',
    MB: 'unit.size.megabyte',
    GB: 'unit.size.gigabyte',
    TB: 'unit.size.terabyte',
  };

  return UNIT_TO_STRING_ID[unit] || 'unit.size.byte';
}
