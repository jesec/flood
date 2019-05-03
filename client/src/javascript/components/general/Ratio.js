import {FormattedNumber} from 'react-intl';
import React from 'react';

export default class Ratio extends React.Component {
  render() {
    let ratio = this.props.value;

    ratio /= 1000;
    let precision = 1;

    if (ratio < 10) {
      precision = 2;
    } else if (ratio >= 100) {
      precision = 0;
    }

    ratio = ratio.toFixed(precision);

    return <FormattedNumber value={ratio} />;
  }
}
