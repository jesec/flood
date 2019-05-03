const moment = require('moment');

const formatUtil = {
  secondsToDuration: cumSeconds => {
    const years = Math.floor(cumSeconds / 31536000);
    const weeks = Math.floor((cumSeconds % 31536000) / 604800);
    const days = Math.floor(((cumSeconds % 31536000) % 604800) / 86400);
    const hours = Math.floor((((cumSeconds % 31536000) % 604800) % 86400) / 3600);
    const minutes = Math.floor(((((cumSeconds % 31536000) % 604800) % 86400) % 3600) / 60);
    const seconds = Math.floor(cumSeconds - minutes * 60);
    let timeRemaining = null;

    if (years > 0) {
      timeRemaining = {years, weeks, cumSeconds};
    } else if (weeks > 0) {
      timeRemaining = {weeks, days, cumSeconds};
    } else if (days > 0) {
      timeRemaining = {days, hours, cumSeconds};
    } else if (hours > 0) {
      timeRemaining = {hours, minutes, cumSeconds};
    } else if (minutes > 0) {
      timeRemaining = {minutes, seconds, cumSeconds};
    } else {
      timeRemaining = {seconds, cumSeconds};
    }

    return timeRemaining;
  },

  minToHumanReadable: min => moment.duration(min * 60 * 1000).humanize(),

  parsePeers: string => {
    // This lovely delimiter is defined in clientResponseUtil.
    const markerPosition = string.indexOf('@!@');
    return string.substr(0, markerPosition);
  },

  status: (isHashChecking, isComplete, isOpen, uploadRate, downloadRate, state, message) => {
    const torrentStatus = [];

    if (isHashChecking === '1') {
      torrentStatus.push('ch'); // checking
    } else if (isComplete === '1' && isOpen === '1' && state === '1') {
      torrentStatus.push('sd'); // seeding
    } else if (isComplete === '1' && isOpen === '1' && state === '0') {
      torrentStatus.push('p'); // paused
    } else if (isComplete === '1' && isOpen === '0') {
      torrentStatus.push('c'); // complete
    } else if (isComplete === '0' && isOpen === '1' && state === '1') {
      torrentStatus.push('d'); // downloading
    } else if (isComplete === '0' && isOpen === '1' && state === '0') {
      torrentStatus.push('p'); // paused
    } else if (isComplete === '0' && isOpen === '0') {
      torrentStatus.push('s'); // stopped
    }

    if (message.length) {
      torrentStatus.push('e'); // error
    }

    if (uploadRate === '0' && downloadRate === '0') {
      torrentStatus.push('i');
    } else {
      torrentStatus.push('a');
    }

    return torrentStatus;
  },
};

module.exports = formatUtil;
