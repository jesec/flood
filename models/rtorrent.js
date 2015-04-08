var xmlrpc = require('xmlrpc')
// var fs = require('fs');
// var path = require('path');
// var request = require('request');
// var portscanner = require('portscanner');
// var readTorrent = require('read-torrent');
// var logger = require('winston');
var Q = require('q');
// var nconf = require('nconf');
var net = require('net');
// var rimraf = require('rimraf');
var Deserializer = require('./deserializer');
var Serializer = require('./serializer');

// function htmlspecialchars(str) {
// 	return str.replace(/\&/ig,'&amp;').replace(/\'/ig,'&quot;').replace(/\'/ig,'&#039;').replace(/\</ig,'&lt;').replace(/\>/ig,'&gt;');
// }

// if (!(nconf.get('rtorrent:option') === 'scgi' || nconf.get('rtorrent:option') === 'xmlrpc')) {
// 	var err = new Error('Config for rtorrent option is not valid. Please check config.json rtorrent.option property.');
// 	logger.error(err.message);
// 	throw err;
// }

// logger.info('Connect to rtorrent via', nconf.get('rtorrent:option'));

// need something to test connection to rtorrent first...

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

// function methodCall (api, array) {
//
// 	if (nconf.get('rtorrent:option') === 'xmlrpc') {
// 		return xmlrpcMethodCall(api, array);
// 	}
//
// 	if (nconf.get('rtorrent:option') === 'scgi') {
// 		return scgiMethodCall(api, array);
// 	}
// }
//
// rtorrent.init = function () {
// 	return createThrottleSettings()
// 		.then(function () {
// 			logger.info('Finished creating throttle settings.');
// 		}, function (err) {
// 			if (err.code == 'ECONNREFUSED') {
// 				throw new Error('Unable to connect to rtorrent.');
// 			}
// 		});
// }
//
// function createThrottleSettings () {
// 	logger.info('Creating throttle settings.');
// 	var upload_throttles = [];
// 	var download_throttles = [];
// 	var throttle_settings = [];
// 	var createThrottleSettingList = [];
//
// 	var throttleSpeed = 16;
// 	for (var i = 5 - 1; i >= 0; i--) {
// 		upload_throttles.push({
// 			display: 'Up_' + throttleSpeed,
// 			name: 'up_' + i,
// 			up: throttleSpeed,
// 			down: 0,
// 			direction: 'up'
// 		});
// 		throttleSpeed = throttleSpeed * 2
// 	}
//
// 	throttleSpeed = 16;
// 	for (var i = 5 - 1; i >= 0; i--) {
// 		download_throttles.push({
// 			display: 'Down_' + throttleSpeed,
// 			name: 'down_' + i,
// 			up: 0,
// 			down: throttleSpeed,
// 			direction: 'down'
// 		});
// 		throttleSpeed = throttleSpeed * 2
// 	}
//
// 	throttle_settings = upload_throttles.concat(download_throttles);
//
// 	for (var i = throttle_settings.length - 1; i >= 0; i--) {
// 		createThrottleSettingList.push(createThrottleSetting(throttle_settings[i]));
// 	}
//
// 	return Q.all(createThrottleSettingList);
// }
//
// function createThrottleSetting (throttleSetting) {
// 	switch(throttleSetting.direction) {
// 		case 'up':
// 			return rtorrent.throttleUp('' + throttleSetting.name, '' + throttleSetting.up);
// 		break;
// 		case 'down':
// 			return rtorrent.throttleDown('' + throttleSetting.name, '' + throttleSetting.up);
// 		break;
// 	}
// }
//
// rtorrent.throttleUp = function (name, value) {
// 	return methodCall('throttle_up', [name, value]);
// }
//
// rtorrent.throttleDown = function (name, value) {
// 	return methodCall('throttle_down', [name, value]);
// }
//
// rtorrent.setThrottle = function (hash, throttle_name) {
// 	return rtorrent.pauseTorrent(hash)
// 		.then(function () {
// 			return rtorrent.setThrottleName(hash, throttle_name);
// 		})
// 		.then(function () {
// 			return rtorrent.startTorrent(hash);
// 		});
// }
//
// rtorrent.setThrottleName = function (hash, throttle_name) {
// 	return methodCall('d.set_throttle_name', [hash, throttle_name]);
// }
//
// // get_complete, is_open, is_hash_checking, get_state
// // need to figure out better way of getting the status
// function getStatus (value) {
// 	if (value[0] === '1' && value[1] === '1' && value[2] === '0' && value[3] === '1') {
// 		return 'seeding';
// 	} else if (value[0] === '1' && value[1] === '0' && value[2] === '0' && value[3] === '0') {
// 		return 'finished';
// 	} else if (value[0] === '0' && value[1] === '1' && value[2] === '0' && value[3] === '1') {
// 		return 'downloading';
// 	} else if (value[0] === '0' && value[1] === '0' && value[2] === '0' && value[3] === '1') {
// 		// stopped in the middle
// 		return 'stopped';
// 	} else if (value[0] === '0' && value[1] === '0' && value[2] === '0' && value[3] === '0') {
// 		// i dont know stopped
// 		return 'stopped';
// 	} else if (value[0] === '0' && value[1] === '1' && value[2] === '0' && value[3] === '0') {
// 		return 'paused';
// 	} else if (value[0] === '1' && value[1] === '1' && value[2] === '0' && value[3] === '0') {
// 		// seeding pause
// 		return 'paused';
// 	} else if (value[0] === '1' && value[1] === '0' && value[2] === '0' && value[3] === '1') {
// 		return 'finished';
// 	} else if (value[2] === '1') {
// 		return 'checking';
// 	}
// }
//
// function adaptTorrentArray (torrent) {
// 	return {
// 		name: torrent[0],
// 		hash: torrent[1],
// 		id: torrent[1],
// 		size: parseInt(torrent[2], 10),
// 		downloaded: parseInt(torrent[3], 10),
// 		uploaded: parseInt(torrent[12], 10),
// 		dl_speed: parseInt(torrent[4], 10),
// 		ul_speed: parseInt(torrent[5], 10),
// 		percent_downloaded: (torrent[3] / torrent[2]).toFixed(4),
// 		time_remaining: (torrent[2] - torrent[3]) / torrent[4] | 0,
// 		status: getStatus(torrent.slice(6, 10)),
// 		seeds: parseInt(torrent[10], 10),
// 		peers: parseInt(torrent[11], 10),
// 		total_peers: 0,
// 		total_seeds: 0
// 	}
// }
//
// rtorrent.getTorrents = function () {
// 	return methodCall('d.multicall', ['main', 'd.name=', 'd.hash=', 'd.size_bytes=', 'd.bytes_done=', 'd.get_down_rate=', 'd.get_up_rate=', 'd.get_complete=', 'd.is_open=', 'd.is_hash_checking=', 'd.get_state=', 'd.get_peers_complete=', 'd.get_peers_accounted=', 'd.get_up_total='])
// 		.then(function (data) {
//
// 			// If array is empty, return empty array
// 			if (data.length === 0) {
// 				return [];
// 			}
//
// 			// Adapt array from rtorrent properly for consumption by client
// 			var torrents = data.map(function (torrent) {
// 				return adaptTorrentArray(torrent);
// 			});
//
// 			// Declare multical array specifically for getting torrent data
// 			var systemMultiCallArray = [];
//
// 			// Loop through torrents from main call and push method call to get peers and seeds
// 			// Note: The order in which it is pushed matters. The returned array from rtorrent will be
// 			// an array of array of array of array of values
// 			torrents.forEach(function (torrent) {
//
// 				// Push peers first for the torrent
// 				systemMultiCallArray.push({
// 					methodName: 't.multicall',
// 					params: [torrent.hash, 'd.get_hash=', 't.get_scrape_incomplete=']
// 				});
//
// 				// Push seeds second for the torrent
// 				systemMultiCallArray.push({
// 					methodName: 't.multicall',
// 					params: [torrent.hash, 'd.get_hash=', 't.get_scrape_complete=']
// 				});
// 			});
//
// 			// Do the system.multicall and return promise
// 			// Inside the resolve function, we loop through the array
// 			return methodCall('system.multicall', [systemMultiCallArray]).then(function(data) {
// 				var numberArray = [];
//
// 				// The length of data should be equal to the length of systemMultiCallArray
// 				data.forEach(function(item) {
// 					// Each item in the array has an array of arrays
// 					 item.forEach(function(itemagain) {
// 					 	// Map and reduce the array to get the number
// 						var number = itemagain.map(function (value) {
// 								return parseInt(value, 10);
// 							})
// 							.reduce(function (a, b) {
// 								return a + b;
// 							}, 0);
// 						// Push the number to a clean array so that we can place it correctly back into
// 						// the torrent object to return to client
// 						numberArray.push(number);
// 					});
// 				});
//
// 				// Map torrents and shift from numberArray to get the correct order
// 				// Peers is first, followed by seeds.
// 				// Return each torrent and finally return torrents back to caller.
// 				return torrents.map(function (torrent) {
// 					torrent.total_peers = numberArray.shift();
// 					torrent.total_seeds = numberArray.shift();
// 					return torrent;
// 				});
// 			});
// 		});
// }
//
// rtorrent.loadTorrentFile = function (filepath) {
// 	return methodCall('load', [filepath, 'd.set_custom=x-filename']);
// }
//
// rtorrent.loadTorrentStart = function (url) {
// 	return methodCall('load_start', [url]);
// }
//
//
// rtorrent.getTorrentMetaData = function (torrent) {
// 	var deferred = Q.defer();
//
// 	readTorrent(torrent.url, {}, function (err, data) {
// 		if (err) {
// 			deferred.reject(err);
// 		}
//
// 		deferred.resolve(data);
// 	});
//
// 	return deferred.promise;
// }
//
// rtorrent.getHash = function (hash) {
// 	return methodCall('d.get_hash', [hash]);
// }
//
// function checkPathExists (path) {
// 	var deferred = Q.defer();
// 	fs.exists(path, function (exists) {
// 		if (exists) {
// 			deferred.resolve(exists);
// 		}
//
// 		deferred.reject(new Error('Path does not exist.'));
// 	})
// 	return deferred.promise;
// }
//
//
// rtorrent.loadTorrent = function (torrent) {
// 	return rtorrent.getTorrentMetaData(torrent)
// 		.then(function (data) {
// 			var hash = data.infoHash.toUpperCase();
// 			logger.info('Retrieved hash from torrent', hash);
//
// 			// Check if torrent path is passed as a parameter
// 			if (torrent.path) {
// 				// Check if path exists
// 				logger.info('Checking if path exists.');
//
// 				return checkPathExists(torrent.path)
// 					.then(function (data) {
//
// 						logger.info('Directory exists.');
//
// 						// Load torrent but do not start
// 						return methodCall('load', [torrent.url])
// 							.then(function () {
// 								return Q.delay(500)
// 									.then(function () {
// 										// Get torrent hash
// 										return rtorrent.getHash(hash)
// 											.then(function () {
// 												return rtorrent.setTorrentDirectory(hash, torrent.path)
// 													.then(function () {
// 														return rtorrent.startTorrent(hash);
// 													});
// 											});
// 									})
// 							});
// 					}, function () {
//
// 						logger.info('Directory does not exist.');
//
// 						var joinedPath = path.join('/', torrent.path);
//
// 						return Q.nfcall(fs.mkdir, joinedPath)
// 							.then(function () {
// 								logger.info('Created directory', joinedPath);
//
// 								logger.info('Setting directory of torrent to', joinedPath);
//
// 								// Load torrent but do not start
// 								return methodCall('load', [torrent.url])
// 									.then(function () {
// 										return Q.delay(500)
// 											.then(function () {
// 												// Get torrent hash
// 												return rtorrent.getHash(hash)
// 													.then(function () {
// 														return rtorrent.setTorrentDirectory(hash, joinedPath)
// 															.then(function () {
// 																return rtorrent.startTorrent(hash);
// 															});
// 													});
// 											});
// 									});
//
// 							}, function (err) {
//
// 								if (err.code == 'EACCES') {
// 									throw new Error('Unable to create directory for torrent due to permissions.', hash);
// 								}
//
// 								// THrow error if not EACESS
// 								throw err;
// 							});
// 					});
// 			}
//
// 			// Start torrent if no path is passed
// 			return rtorrent.loadTorrentStart(torrent.url);
// 		});
// }
//
// rtorrent.setTorrentDirectory = function (hash, path) {
// 	return methodCall('d.set_directory', [hash, path]);
// }
//
// rtorrent.startTorrent = function (hash) {
// 	return methodCall('d.start', [hash])
// 		.then(function () {
// 			return methodCall('d.resume', [hash]);
// 		});
// }
//
// rtorrent.stopTorrent = function (hash) {
// 	return methodCall('d.close', [hash]);
// }
//
// rtorrent.pauseTorrent = function (hash) {
// 	return methodCall('d.stop', [hash]);
// }
//
// rtorrent.removeTorrent = function (hash) {
// 	return methodCall('d.erase', [hash]);
// }
//
// rtorrent.deleteTorrentData = function (hash) {
// 	return rtorrent.stopTorrent(hash).then(function() {
// 		return rtorrent.isMultiFile(hash).then(function(data) {
// 			return rtorrent.getTorrentDirectory(hash).then(function(dir) {
// 				if (data === '1') {
// 					logger.info(hash, 'is a multifile torrent.');
// 					logger.info('Deleting directory path/file', dir);
// 					return deleteData(dir).then(function(data) {
// 						return rtorrent.removeTorrent(hash);
// 					});
// 				} else {
// 					logger.info(hash, 'is a single file torrent.');
// 					return rtorrent.getTorrentName(hash).then(function(name) {
// 						logger.info('Deleting directory path/file', dir + '/' + name)
// 						return deleteData(dir + '/' + name).then(function(data) {
// 							return rtorrent.removeTorrent(hash);
// 						});
// 					});
// 				}
//
// 			});
// 		});
// 	});
// }
//
// // function deleteData (path) {
// // 	var deferred = Q.defer();
// //
// // 	rimraf(path, function(err, results) {
// // 		if (err) {
// // 			deferred.reject(err)
// // 		}
// //
// // 		deferred.resolve(results);
// // 	});
// //
// // 	return deferred.promise;
// // }
//
// rtorrent.getTorrentName = function (hash) {
// 	return methodCall('d.get_name', [hash]);
// }
//
// rtorrent.getBasePath = function (hash) {
// 	return methodCall('d.get_base_path', [hash]);
// }
//
// rtorrent.isMultiFile = function (hash) {
// 	return methodCall('d.is_multi_file', [hash]);
// }
//
// rtorrent.getTorrentDirectory = function (hash) {
// 	return methodCall('d.get_directory', [hash]);
// }
//
// rtorrent.getNetworkListenPort = function () {
// 	return methodCall('network.listen.port', []);
// }
//
// rtorrent.setPriority = function (priority) {
// 	return methodCall('d.set_priority', [hash, priority]);
// }
//
// // change to use nconf
// rtorrent.getPortStatus = function (port) {
// 	var deferred = Q.defer();
//
// 	portscanner.checkPortStatus(port, 'localhost', function (err, data) {
// 		if (err) {
// 			return deferred.reject(err);
// 		}
//
// 		return deferred.resolve(data);
// 	});
//
// 	return deferred.promise;
// }
//
// rtorrent.getTotalPeers = function (hash) {
// 	return rtorrent.getScrapeIncomplete(hash)
// 		.then(function (data) {
// 			return data.map(function (value) {
// 				return parseInt(value, 10);
// 			})
// 			.reduce(function (a, b) {
// 				return a + b;
// 			}, 0);
// 		});
// }
//
// rtorrent.getTotalSeeds = function (hash) {
// 	return rtorrent.getScrapeComplete(hash)
// 		.then(function (data) {
// 			return data.map(function (value) {
// 				return parseInt(value, 10);
// 			}).reduce(function (a, b) {
// 				return a + b;
// 			}, 0);
// 		});
// }
//
// rtorrent.getScrapeIncomplete = function (hash) {
// 	return methodCall('t.multicall', [hash, 'd.get_hash=', 't.get_scrape_incomplete=']);
// }
//
// rtorrent.getScrapeComplete = function (hash) {
// 	return methodCall('t.multicall', [hash, 'd.get_hash=', 't.get_scrape_complete=']);
// }
//
// // get_port_range
// // returns string of port range
// rtorrent.getPortRange = function () {
// 	return methodCall('get_port_range', [])
// 		.then(function (data) {
// 			return {
// 				'port_range': data
// 			}
// 		});
// }
//
// rtorrent.setPortRange = function (value) {
// 	return methodCall('set_port_range', [value]);
// }
//
// // get_port_open
// // returns 1 or 0
// // Opens listening port
// rtorrent.getPortOpen = function () {
// 	return methodCall('get_port_open', [])
// 		.then(function (data) {
// 			return {
// 				'port_open': data == 1 ? true : false
// 			}
// 		});
// }
//
// rtorrent.setPortOpen = function (value) {
// 	return methodCall('set_port_open', [value]);
// }
//
// rtorrent.getUploadSlots = function () {
// 	return methodCall('get_max_uploads', [])
// 		.then(function (data) {
// 			return {
// 				'max_uploads': data
// 			}
// 		});
// }
//
// rtorrent.setUploadSlots = function (value) {
// 	return methodCall('set_max_uploads', [value]);
// }
//
// rtorrent.getUploadSlotsGlobal = function () {
// 	return methodCall('get_max_uploads_global', [])
// 		.then(function (data) {
// 			return {
// 				'max_uploads_global': data
// 			}
// 		});
// }
//
// rtorrent.setUploadSlotsGlobal = function (value) {
// 	return methodCall('set_max_uploads_global', [value]);
// }
//
// rtorrent.getDownloadSlotsGlobal = function () {
// 	return methodCall('get_max_downloads_global', [])
// 		.then(function (data) {
// 			return {
// 				'max_downloads_global': data
// 			}
// 		});
// }
//
// rtorrent.setDownloadSlotsGlobal = function (value) {
// 	return methodCall('set_max_downloads_global', [value]);
// }
//
// // get_port_random
// // returns 1 or 0
// // Randomize port each time rTorrent starts
// rtorrent.getPortRandom = function () {
// 	return methodCall('get_port_random', [])
// 		.then(function (data) {
// 			return {
// 				'port_random': data == 1 ? true : false
// 			}
// 		});
// }
//
// rtorrent.setPortRandom = function (value) {
// 	return methodCall('set_port_random', [value]);
// }
//
// // get_download_rate
// // returns value in bytes
// rtorrent.getGlobalMaximumDownloadRate = function () {
// 	return methodCall('get_download_rate', [])
// 		.then(function (data) {
// 			return {
// 				'global_max_download_rate': data
// 			}
// 		});
// }
//
// // set_download_rate
// // requires value in bytes
// rtorrent.setGlobalMaximumDownloadRate = function (value) {
// 	return methodCall('set_download_rate', [value]);
// }
//
// // get_upload_rate
// // returns value in bytes
// rtorrent.getGlobalMaximumUploadRate = function () {
// 	return methodCall('get_upload_rate', [])
// 		.then(function (data) {
// 			return {
// 				'global_max_upload_rate': data
// 			}
// 		});
// }
//
// rtorrent.getMinNumberPeers = function () {
// 	return methodCall('get_min_peers', [])
// 		.then(function (data) {
// 			return {
// 				'min_peers': data
// 			}
// 		});
// }
//
// rtorrent.setMinNumberPeers = function (value) {
// 	return methodCall('set_min_peers', [value]);
// }
//
// rtorrent.getMinNumberSeeds = function () {
// 	return methodCall('get_min_peers_seed', [])
// 		.then(function (data) {
// 			return {
// 				'min_seeds': data
// 			}
// 		});
// }
//
// rtorrent.setMinNumberSeeds = function (value) {
// 	return methodCall('set_min_peers_seed', [value]);
// }
//
// rtorrent.getMaxNumberPeers = function () {
// 	return methodCall('get_max_peers', [])
// 		.then(function (data) {
// 			return {
// 				'max_peers': data
// 			}
// 		});
// }
//
// rtorrent.setMaxNumberPeers = function (value) {
// 	return methodCall('set_max_peers', [value]);
// }
//
// rtorrent.getMaxNumberSeeds = function () {
// 	return methodCall('get_max_peers_seed', [])
// 		.then(function (data) {
// 			return {
// 				'max_seeds': data
// 			}
// 		});
// }
//
// rtorrent.setMaxNumberSeeds = function (value) {
// 	return methodCall('set_max_peers_seed', [value]);
// }
//
// // set_upload_rate
// // requires value in bytes
// rtorrent.setGlobalMaximumUploadRate = function (value) {
// 	return methodCall('set_upload_rate', [value]);
// }
//
// rtorrent.getDirectory = function () {
// 	return methodCall('get_directory', [])
// 		.then(function (data) {
// 				return {
// 					'download_directory': data
// 				}
// 			});
// }
//
// rtorrent.setDirectory = function (value) {
// 	return methodCall('set_directory', [value]);
// }

module.exports = rtorrent;
