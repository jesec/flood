var util = require('util');

var FormatUtil = {
  percentComplete: function(numerator, denominator) {

  },

  eta: function(rate, completed, total) {
    
  },

  parsePeers: function(string) {
    var markerPosition = string.indexOf('@!@');
    return string.substr(0, markerPosition);
  },

  status: function(isHashChecking, isComplete, isOpen, uploadRate, downloadRate, state, message) {
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
