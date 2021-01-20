import {FC} from 'react';

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
    await import(/* webpackChunkName: 'flag' */ `../../../images/flags/${countryCode.toLowerCase()}.png`)
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
