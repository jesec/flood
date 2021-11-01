import UserInDatabase2 from './00-UserInDatabase2';
import UserInDatabase3 from './01-UserInDatabase3';
import HistoryEra from './02-HistoryEra';

const migrations = [UserInDatabase2, UserInDatabase3, HistoryEra];

const migrate = async () => {
  for await (const migrate of migrations) {
    await migrate();
  }
};

export default migrate;
