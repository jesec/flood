import UserInDatabase2 from './UserInDatabase2';

const migrations = [UserInDatabase2];

const migrate = () => Promise.all(migrations.map((migration) => migration()));

export default migrate;
