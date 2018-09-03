const perUserRtorrentInstances = require('./per-user-rtorrent-instances');

const migrations = [perUserRtorrentInstances];

const migrate = () => Promise.all(migrations.map(migration => migration()));

module.exports = migrate;
