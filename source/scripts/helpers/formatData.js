var format = {

    data: function(bytes, extraUnits, precision) {

        var precision = precision || 2;

    	var kilobyte = 1024,
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
    		unit = 'kB';
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
    		'value': value,
    		'unit': unit
    	};

    }

}

module.exports = format;
