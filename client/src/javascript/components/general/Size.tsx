import {FC} from 'react';
import {useLingui} from '@lingui/react';

import {compute, getTranslationString} from '../../util/size';

interface SizeProps {
  value: number;
  precision?: number;
  isSpeed?: boolean;
  className?: string;
}

const Size: FC<SizeProps> = ({value, isSpeed, className, precision}: SizeProps) => {
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
      {Number.isNaN(computed.value) ? '—' : i18n.number(computed.value)}
      <em className="unit">{translatedUnit}</em>
    </span>
  );
};

Size.defaultProps = {
  isSpeed: false,
  precision: 2,
  className: undefined,
};

export default Size;
