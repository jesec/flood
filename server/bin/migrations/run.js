const perUserRtorrentInstances = require('./per-user-rtorrent-instances');
const fixIsAdminFlag = require('./fix-is-admin-flag');

const migrations = [perUserRtorrentInstances, fixIsAdminFlag];

const migrate = () => Promise.all(migrations.map(migration => migration()));

module.exports = migrate;
