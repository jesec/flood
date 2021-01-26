import UserInDatabase2 from './UserInDatabase2';
import UserInDatabase3 from './UserInDatabase3';

const migrations = [UserInDatabase2, UserInDatabase3];

const migrate = () => Promise.all(migrations.map((migration) => migration()));

export default migrate;
