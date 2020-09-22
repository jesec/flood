const migrations = [
  () => {
    // do nothing. there is no migration at the moment.
  },
];

const migrate = () => Promise.all(migrations.map((migration) => migration()));

export default migrate;
