import React from 'react';

const flagsCache: Record<string, string | null> = {};

const getFlag = (countryCode?: string): string | null => {
  if (countryCode == null) {
    return null;
  }

  if (flagsCache[countryCode] !== undefined) {
    return flagsCache[countryCode];
  }

  const loadFlag = async () => {
    let flag: string | null = null;
    await import(`../../../images/flags/${countryCode.toLowerCase()}.png`)
      .then(
        ({default: image}: {default: string}) => {
          flag = image;
        },
        () => {
          flag = null;
        },
      )
      .finally(() => {
        flagsCache[countryCode] = flag;
      });
    return flag;
  };

  // eslint-disable-next-line @typescript-eslint/no-throw-literal
  throw loadFlag();
};

interface CountryFlagIconProps {
  countryCode: string;
}

const CountryFlagIcon: React.FC<CountryFlagIconProps> = ({countryCode}: CountryFlagIconProps) => {
  const flag = getFlag(countryCode);
  if (flag == null) {
    return null;
  }
  return <img alt={countryCode} className="peers-list__flag__image" src={flag} />;
};

export default CountryFlagIcon;
