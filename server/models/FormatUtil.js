var util = require('util');

var FormatUtil = {
  percentComplete: function(numerator, denominator) {
    return (numerator / denominator * 100).toFixed(2);
  },

  eta: function(rate, completed, total) {
    if (rate > 0) {
      var seconds = (total - completed) / rate;
      var years = Math.floor(seconds / 31536000);
      var weeks = Math.floor((seconds % 31536000) / 604800);
      var days = Math.floor(((seconds % 31536000) % 604800) / 86400);
      var hours = Math.floor((((seconds % 31536000) % 604800) % 86400) / 3600);
      var minutes = Math.floor(((((seconds % 31536000) % 604800) % 86400) % 3600) / 60);
      var wholeSeconds = Math.floor((((((seconds % 31536000) % 604800) % 86400) % 3600) % 60) / 60);

      var timeRemaining = {};

      if (years > 0) {
        timeRemaining = {
          years: years,
          weeks: weeks,
          seconds: wholeSeconds
        };
      } else if (weeks > 0) {
        timeRemaining = {
          weeks: weeks,
          days: days,
          seconds: wholeSeconds
        };
      } else if (days > 0) {
        timeRemaining = {
          days: days,
          hours: hours,
          seconds: wholeSeconds
        };
      } else if (hours > 0) {
        timeRemaining = {
          hours: hours,
          minutes: minutes,
          seconds: wholeSeconds
        };
      } else if (minutes > 0) {
        timeRemaining = {
          minutes: minutes,
          seconds: wholeSeconds
        };
      } else {
        timeRemaining = {
          seconds: wholeSeconds
        };
      }

      return timeRemaining;
    } else {
      return 'Infinity';
    }
  },

  status: function(isHashChecking, isComplete, isOpen, uploadRate, downloadRate, state) {
    var torrentStatus = [];

    if (isHashChecking === '1') {
      torrentStatus.push('is-checking');
    } else if (isComplete === '1' && isOpen === '1' && state === '1') {
      torrentStatus.push('is-seeding');
  	} else if (isComplete === '1' && isOpen === '1' && state === '0') {
      torrentStatus.push('is-paused');
  	} else if (isComplete === '1' && isOpen === '0' && state === '0') {
      torrentStatus.push('is-completed');
  	} else if (isComplete === '1' && isOpen === '0' && state === '1') {
      torrentStatus.push('is-completed');
  	} else if (isComplete === '0' && isOpen === '1' && state === '1') {
      torrentStatus.push('is-downloading');
  	} else if (isComplete === '0' && isOpen === '1' && state === '0') {
      torrentStatus.push('is-paused');
  	} else if (isComplete === '0' && isOpen === '0' && state === '1') {
      torrentStatus.push('is-stopped');
  	} else if (isComplete === '0' && isOpen === '0' && state === '0') {
      torrentStatus.push('is-stopped');
  	}

    if (uploadRate === '0' && downloadRate === '0') {
      torrentStatus.push('is-inactive');
    } else {
      torrentStatus.push('is-active');
    }

    return torrentStatus.join(' ');
  }
}

module.exports = FormatUtil;
