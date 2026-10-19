import {FC} from 'react';
import {useLingui} from '@lingui/react';

import {compute, getTranslationString} from '../../util/size';
import {formatNumber} from '../../util/format';

interface SizeProps {
  value: number;
  precision?: number;
  isSpeed?: boolean;
  className?: string;
}

const Size: FC<SizeProps> = ({value, isSpeed = false, className, precision = 2}: SizeProps) => {
  const computed = compute(value, precision);
  const {i18n} = useLingui();

  let translatedUnit = i18n._(getTranslationString(computed.unit));

  if (isSpeed) {
    translatedUnit = i18n._('unit.speed', {
      baseUnit: translatedUnit,
    });
  }

  return (
    <span className={className}>
      {Number.isNaN(computed.value) ? '—' : formatNumber(i18n.locale, computed.value)}
      <em className="unit">{translatedUnit}</em>
    </span>
  );
};

export default Size;
