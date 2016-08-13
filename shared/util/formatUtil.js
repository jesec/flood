'use strict';
let moment = require('moment');

var FormatUtil = {
  minToHumanReadable: min => {
    return moment.duration(min * 60 * 1000).humanize();
  },

  parsePeers: (string) => {
    var markerPosition = string.indexOf('@!@');
    return string.substr(0, markerPosition);
  },

  status: (isHashChecking, isComplete, isOpen, uploadRate, downloadRate, state, message) => {
    var torrentStatus = [];

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
  }
}

module.exports = FormatUtil;
