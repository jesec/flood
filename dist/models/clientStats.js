var client = require('./client')();

function clientStats() {

    if((this instanceof clientStats) === false) {
        return new clientStats();
    }
};

clientStats.prototype.getStats = function(callback) {

    client.getClientStats(callback);
};

module.exports = clientStats;
