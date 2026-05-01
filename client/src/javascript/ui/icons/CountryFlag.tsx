import {FC} from 'react';

const flagModules = import.meta.glob('../../../images/flags/*.png', {
  query: '?url',
  import: 'default',
});

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
    const key = `../../../images/flags/${countryCode.toLowerCase()}.png`;
    const loader = flagModules[key];
    if (loader) {
      try {
        flag = (await loader()) as string;
      } catch {
        flag = null;
      }
    } else {
      flag = null;
    }
    flagsCache[countryCode] = flag;
    return flag;
  };

  throw loadFlag();
};

interface CountryFlagProps {
  countryCode: string;
}

const CountryFlag: FC<CountryFlagProps> = ({countryCode}: CountryFlagProps) => {
  const flag = getFlag(countryCode);
  if (flag == null) {
    return null;
  }
  return <img alt={countryCode} title={countryCode} className="peers-list__flag__image" src={flag} />;
};

export default CountryFlag;
