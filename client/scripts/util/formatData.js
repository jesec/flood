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
