import {formatMessage, FormattedNumber, injectIntl} from 'react-intl';
import React from 'react';

import {compute, getTranslationString} from '../../util/size';

class Size extends React.Component {
  render() {
    const {value, isSpeed, precision, intl} = this.props;

    const computed = compute(value, precision);

    let translatedUnit = intl.formatMessage({id: getTranslationString(computed.unit)});

    if (isSpeed) {
      translatedUnit = intl.formatMessage({
        id: 'unit.speed',
        defaultMessage: '{baseUnit}/s'
      }, {
        baseUnit: translatedUnit
      });
    }

    return (
      <span>
        <FormattedNumber value={computed.value} />
        <em className="unit">{translatedUnit}</em>
      </span>
    );
  }
}

Size.defaultProps = {
  isSpeed: false,
  precision: 2
};

export default injectIntl(Size);
