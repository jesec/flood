import {FormattedNumber, useIntl} from 'react-intl';
import * as React from 'react';

import {compute, getTranslationString} from '../../util/size';

const renderNumber = (computedNumber: ReturnType<typeof compute>) => {
  if (Number.isNaN(computedNumber.value)) {
    return '—';
  }

  return <FormattedNumber value={computedNumber.value} />;
};

interface SizeProps {
  value: number;
  precision?: number;
  isSpeed?: boolean;
  className?: string;
}

const Size: React.FC<SizeProps> = ({value, isSpeed, className, precision}: SizeProps) => {
  const computed = compute(value, precision);
  const intl = useIntl();

  let translatedUnit = intl.formatMessage({id: getTranslationString(computed.unit)});

  if (isSpeed) {
    translatedUnit = intl.formatMessage(
      {
        id: 'unit.speed',
      },
      {
        baseUnit: translatedUnit,
      },
    );
  }

  return (
    <span className={className}>
      {renderNumber(computed)}
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
