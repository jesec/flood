import perUserRtorrentInstances from './per-user-rtorrent-instances';
import fixIsAdminFlag from './fix-is-admin-flag';

const migrations = [perUserRtorrentInstances, fixIsAdminFlag];

const migrate = () => Promise.all(migrations.map((migration) => migration()));

export default migrate;
