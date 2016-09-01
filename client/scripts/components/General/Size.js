import React from 'react';

export default class Size extends React.Component {
  compute(bytes, extraUnits, precision) {
    let kilobyte = 1024,
      megabyte = kilobyte * 1024,
      gigabyte = megabyte * 1024,
      terabyte = gigabyte * 1024,
      value = 0,
      unit = '';

    if ((bytes >= 0) && (bytes < kilobyte)) {
      value = bytes;
      unit = 'B';
    } else if ((bytes >= kilobyte) && (bytes < megabyte)) {
      value = (bytes / kilobyte);
      unit = 'KB';
    } else if ((bytes >= megabyte) && (bytes < gigabyte)) {
      value = (bytes / megabyte);
      unit = 'MB';
    } else if ((bytes >= gigabyte) && (bytes < terabyte)) {
      value = (bytes / gigabyte);
      unit = 'GB';
    } else if (bytes >= terabyte) {
      value = (bytes / terabyte);
      unit = 'TB';
    } else {
      value = bytes;
      unit = 'B';
    }

    value = Number(value);
    if (!!value && value < 10) {
      value = Number(value.toFixed(precision));
    } else if (!!value && value > 10 && value < 100) {
      value = Number(value.toFixed(precision - 1));
    } else if (!!value && value > 100) {
      value = Math.floor(value);
    }

    if (extraUnits) {
      unit += extraUnits;
    }

    return {
      value,
      unit
    };
  }

  render() {
    let {value, unit} = this.compute(this.props.value, this.props.extraUnits, this.props.precision);

    return (
      <span>
        {value}
        <em className="unit">{unit}</em>
      </span>
    );
  }
}

Size.defaultProps = {
  extraUnits: '',
  precision: 2
};
