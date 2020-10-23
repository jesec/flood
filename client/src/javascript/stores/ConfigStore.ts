let disableUsersAndAuth = false;

class ConfigStore {
  static getBaseURI(): string {
    const {pathname} = window.location;
    return pathname.substr(0, pathname.lastIndexOf('/') + 1);
  }

  static getPollInterval(): number {
    return Number(process.env.POLL_INTERVAL) || 5000;
  }

  static getDisableAuth(): boolean {
    return disableUsersAndAuth;
  }

  static setDisableAuth(val: boolean): void {
    disableUsersAndAuth = val;
  }
}

export default ConfigStore;
