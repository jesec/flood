/* eslint-disable @typescript-eslint/no-var-requires */

const migrations = [
  () => require('./03-Database2').default(),
  () => require('./00-UserInDatabase2').default(),
  () => require('./01-UserInDatabase3').default(),
  () => require('./02-HistoryEra').default(),
];

const migrate = async () => {
  for await (const migrate of migrations) {
    await migrate();
  }
};

export default migrate;
