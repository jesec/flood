import {FormattedNumber, injectIntl, WrappedComponentProps} from 'react-intl';
import React from 'react';

import {compute, getTranslationString} from '../../util/size';

interface SizeProps extends WrappedComponentProps {
  value: number;
  precision?: number;
  isSpeed?: boolean;
  className?: string;
}

class Size extends React.Component<SizeProps> {
  static defaultProps = {
    isSpeed: false,
    precision: 2,
  };

  static renderNumber(computedNumber: ReturnType<typeof compute>) {
    if (Number.isNaN(computedNumber.value)) {
      return '—';
    }

    return <FormattedNumber value={computedNumber.value} />;
  }

  render() {
    const {value, isSpeed, className, precision, intl} = this.props;
    const computed = compute(value, precision);

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
        {Size.renderNumber(computed)}
        <em className="unit">{translatedUnit}</em>
      </span>
    );
  }
}

export default injectIntl(Size);
