import React from 'react';

const format = {
  eta: function(eta) {
    if (eta === 'Infinity') {
      return '∞';
    } else if (eta.years > 0) {
      return (
        <span>
          <span className="torrent__details--segment">
            {eta.years}<em className="unit">yr</em>
          </span>
          <span className="torrent__details--segment">
            {eta.weeks}<em className="unit">wk</em>
          </span>
        </span>
      );
    } else if (eta.weeks > 0) {
      return (
        <span>
          <span className="torrent__details--segment">
            {eta.weeks}<em className="unit">wk</em>
          </span>
          <span className="torrent__details--segment">
            {eta.days}<em className="unit">d</em>
          </span>
        </span>
      );
    } else if (eta.days > 0) {
      return (
        <span>
          <span className="torrent__details--segment">
            {eta.days}<em className="unit">d</em>
          </span>
          <span className="torrent__details--segment">
            {eta.hours}<em className="unit">hr</em>
          </span>
        </span>
      );
    } else if (eta.hours > 0) {
      return (
        <span>
          <span className="torrent__details--segment">
            {eta.hours}<em className="unit">hr</em>
          </span>
          <span className="torrent__details--segment">
            {eta.minutes}<em className="unit">m</em>
          </span>
        </span>
      );
    } else if (eta.minutes > 0) {
      return (
        <span>
          <span className="torrent__details--segment">
            {eta.minutes}<em className="unit">m</em>
          </span>
          <span className="torrent__details--segment">
            {eta.seconds}<em className="unit">s</em>
          </span>
        </span>
      );
    } else {
      return (
        <span>
          {eta.seconds}<em className="unit">s</em>
        </span>
      );
    }
  },

  data: function(bytes, extraUnits, precision = 2) {
  	let kilobyte = 1024,
  		megabyte = kilobyte * 1024,
  		gigabyte = megabyte * 1024,
  		terabyte = gigabyte * 1024,
  		value = '',
  		unit = '';

  	if ((bytes >= 0) && (bytes < kilobyte)) {
  		value = bytes;
  		unit = 'B';
  	} else if ((bytes >= kilobyte) && (bytes < megabyte)) {
  		value = (bytes / kilobyte).toFixed(precision);
  		unit = 'KB';
  	} else if ((bytes >= megabyte) && (bytes < gigabyte)) {
  		value = (bytes / megabyte).toFixed(precision);
  		unit = 'MB';
  	} else if ((bytes >= gigabyte) && (bytes < terabyte)) {
  		value = (bytes / gigabyte).toFixed(precision);
  		unit = 'GB';
  	} else if (bytes >= terabyte) {
  		value = (bytes / terabyte).toFixed(precision);
  		unit = 'TB';
  	} else {
  		value = bytes;
  		unit = 'B';
  	}

    if (extraUnits) {
      unit += extraUnits;
    }

  	return {
  		value,
  		unit
  	};
  },

  ratio: function(ratio) {
    ratio = ratio / 1000;
    let precision = 1;

    if (ratio < 10) {
      precision = 2;
    } else if (ratio < 100) {
      precision = 0;
    }

    return ratio.toFixed(precision);
  }
};

export default format;
