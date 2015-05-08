var xmlrpc = require('xmlrpc')
var Q = require('q');
var net = require('net');
var Deserializer = require('./deserializer');
var Serializer = require('./serializer');

var rtorrent = {};

rtorrent.get = function(api, array) {
	var stream = net.connect(5000, 'localhost');
	var deferred = Q.defer();
	var xml;
	var length = 0;

	stream.setEncoding('UTF8');

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

	stream.write(length + ':');

	head.forEach(function (item) {
		stream.write(item);
	});

	stream.write(',');
	stream.write(xml);

	var deserializer = new Deserializer('utf8');
	deserializer.deserializeMethodResponse(stream, function (err, data) {

		if (err) {
			return deferred.reject(err);
		}
		return deferred.resolve(data);
	});

	return deferred.promise;

}

module.exports = rtorrent;
