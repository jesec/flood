var Q = require('q');
var net = require('net');
var Deserializer = require('./util/deserializer');
var Serializer = require('./util/serializer');

var rtorrent = {
	initialized: false,

	get: function(api, array) {
		var stream = net.connect({
			port: 5000,
			host: 'localhost'
		});

		var deferred = Q.defer();

		stream.on('error', function(error) {
			console.log(error);
		});

		stream.setEncoding('UTF8');

		var xml;
		var length = 0;

		try {
			xml = Serializer.serializeMethodCall(api, array);
		} catch (error) {
			console.trace(error);
		}

		var head = [
			'CONTENT_LENGTH' + String.fromCharCode(0) + xml.length + String.fromCharCode(0),
			'SCGI' + String.fromCharCode(0) + '1' + String.fromCharCode(0)
		];

		head.forEach(function (item) {
			length += item.length;
		});

		var payload = length + ':';

		head.forEach(function(item) {
			payload += item;
		});

		payload += ',' + xml;

		stream.write(payload);

		var deserializer = new Deserializer('utf8');

		deserializer.deserializeMethodResponse(stream, function (err, data) {

			if (err) {
				return deferred.reject(err);
			}
			return deferred.resolve(data);
		});

		return deferred.promise;
	}
}

module.exports = rtorrent;
