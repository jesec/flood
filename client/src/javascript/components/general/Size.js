import {FormattedNumber, injectIntl} from 'react-intl';
import React from 'react';

import {compute, getTranslationString} from '../../util/size';

class Size extends React.Component {
  renderNumber(computedNumber) {
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
          defaultMessage: '{baseUnit}/s',
        },
        {
          baseUnit: translatedUnit,
        },
      );
    }

    return (
      <span className={className}>
        {this.renderNumber(computed)}
        <em className="unit">{translatedUnit}</em>
      </span>
    );
  }
}

Size.defaultProps = {
  isSpeed: false,
  precision: 2,
};

export default injectIntl(Size);
