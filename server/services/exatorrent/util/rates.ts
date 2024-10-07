interface RateTick {
  timestamp: number;
  rate: number;
}

export class ExatorrentRateComputer {
  private readonly rate_db: {[key: string]: RateTick};

  constructor() {
    this.rate_db = {};
  }

  public get_rate(key: string, timestamp: number, rate: number): number {
    if (!this.rate_db[key]) {
      this.rate_db[key] = {timestamp, rate};
      return 0;
    }
    const last = this.rate_db[key];
    const rate_diff = rate - last.rate;
    let time_diff = timestamp - last.timestamp;
    if (time_diff === 0) time_diff = 1;

    this.rate_db[key] = {timestamp, rate};

    return rate_diff / time_diff;
  }

  public get_eta(rate: number, completed: number, total: number): number {
    if (rate === 0) {
      return -1;
    }
    return (total - completed) / rate;
  }
}
