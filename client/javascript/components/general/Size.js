import {formatMessage, FormattedNumber, injectIntl} from 'react-intl';
import React from 'react';

class Size extends React.Component {
  compute(bytes, isSpeed, precision) {
    let kilobyte = 1024,
      megabyte = kilobyte * 1024,
      gigabyte = megabyte * 1024,
      terabyte = gigabyte * 1024,
      value = 0,
      unit = '';

    if ((bytes >= 0) && (bytes < kilobyte)) {
      value = bytes;
      unit = this.props.intl.formatMessage({id: 'unit.size.byte', defaultMessage: 'B'});
    } else if ((bytes >= kilobyte) && (bytes < megabyte)) {
      value = (bytes / kilobyte);
      unit = this.props.intl.formatMessage({id: 'unit.size.kilobyte', defaultMessage: 'kB'});
    } else if ((bytes >= megabyte) && (bytes < gigabyte)) {
      value = (bytes / megabyte);
      unit = this.props.intl.formatMessage({id: 'unit.size.megabyte', defaultMessage: 'MB'});
    } else if ((bytes >= gigabyte) && (bytes < terabyte)) {
      value = (bytes / gigabyte);
      unit = this.props.intl.formatMessage({id: 'unit.size.gigabyte', defaultMessage: 'GB'});
    } else if (bytes >= terabyte) {
      value = (bytes / terabyte);
      unit = this.props.intl.formatMessage({id: 'unit.size.terabyte', defaultMessage: 'TB'});
    } else {
      value = bytes;
      unit = this.props.intl.formatMessage({id: 'unit.size.byte', defaultMessage: 'B'});
    }

    value = Number(value);
    if (!!value && value < 10) {
      value = Number(value.toFixed(precision));
    } else if (!!value && value > 10 && value < 100) {
      value = Number(value.toFixed(precision - 1));
    } else if (!!value && value > 100) {
      value = Math.floor(value);
    }

    if (isSpeed) {
      unit = this.props.intl.formatMessage({
        id: 'unit.speed',
        defaultMessage: '{baseUnit}/s'
      }, {
        baseUnit: unit
      });
    }

    return {
      value,
      unit
    };
  }

  render() {
    let {value, unit} = this.compute(this.props.value, this.props.isSpeed, this.props.precision);

    return (
      <span>
        <FormattedNumber value={value} />
        <em className="unit">{unit}</em>
      </span>
    );
  }
}

Size.defaultProps = {
  isSpeed: false,
  precision: 2
};

export default injectIntl(Size);
