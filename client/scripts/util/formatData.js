import React from 'react';

const FORMAT_DATA_UTIL = {
  eta: (eta) => {
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

  data: (bytes, extraUnits, precision = 2, options = {}) => {
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

    if (options.padded === false) {
      let decimal = value % 1;
      if ((decimal < 0.1 && decimal >= 0) || (decimal > -0.1 && decimal <= 0)) {
        value = value.toFixed(0);
      }
    }

    if (extraUnits) {
      unit += extraUnits;
    }

  	return {
  		value,
  		unit
  	};
  },

  ratio: (ratio) => {
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

export default FORMAT_DATA_UTIL;
