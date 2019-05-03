class ServerEvent {
  constructor(res) {
    this.data = '';
    this.res = res;

    // Add 2kb padding for IE.
    const padding = new Array(2049);
    res.write(`:${padding.join(' ')}\n`);
  }

  addData(data) {
    const lines = JSON.stringify(data).split(/\n/);

    this.data = lines.reduce((accumulator, datum) => `${this.data}data:${datum}\n`, this.data);
  }

  emit() {
    this.res.write(`${this.data}\n`);
    this.res.flush();
    this.data = '';
  }

  setID(id) {
    this.res.write(`id:${id}\n`);
  }

  setType(eventType) {
    this.res.write(`event:${eventType}\n`);
  }
}

module.exports = ServerEvent;
