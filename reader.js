const GitHulk = require('githulk');

export default class Reader {
  constructor(options) {}

  read() {
    // Memoize the read promise to minimize github quota usage
    if (!this._dataPromise) {
      this._dataPromise = this.readCore();
    }

    return this._dataPromise;    
  }

  async readCore() {
    throw new Error('Must be implemented by derived class');
  }

  forEach(fn) {
    const data = this.read();
    for(const item in data) {
      fn(item);
    }
  }

  map(fn) {
    const data = this.read();
    return data.map(fn);
  }
}
