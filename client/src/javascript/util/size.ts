const UNIT_TO_STRING_ID = {
  B: 'unit.size.byte',
  kiB: 'unit.size.kilobyte',
  MiB: 'unit.size.megabyte',
  GiB: 'unit.size.gigabyte',
  TiB: 'unit.size.terabyte',
} as const;

type Unit = keyof typeof UNIT_TO_STRING_ID;

export function compute(bytes: number, precision = 2): {value: number; unit: Unit} {
  const kilobyte = 1024;

  const megabyte = kilobyte * 1024;

  const gigabyte = megabyte * 1024;

  const terabyte = gigabyte * 1024;
  let value = 0;

  let unit: Unit;

  if (bytes >= terabyte) {
    value = bytes / terabyte;
    unit = 'TiB';
  } else if (bytes >= gigabyte) {
    value = bytes / gigabyte;
    unit = 'GiB';
  } else if (bytes >= megabyte) {
    value = bytes / megabyte;
    unit = 'MiB';
  } else if (bytes >= kilobyte) {
    value = bytes / kilobyte;
    unit = 'kiB';
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

export function getTranslationString(unit: Unit): (typeof UNIT_TO_STRING_ID)[Unit] {
  return UNIT_TO_STRING_ID[unit] || UNIT_TO_STRING_ID.B;
}
