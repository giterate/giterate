const GitHulk = require('githulk');

module.exports = class Reader {
  constructor({hulk, github}) {
    if (hulk) {
      this.hulk = hulk;
    } else {
      this.hulk = new GitHulk(github);
    }
    this._ctorArgs = arguments;
  }

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

  async forEach(fn) {
    const data = await this.read();
    for(const item in data) {
      fn(item);
    }
  }

  async map(fn) {
    const data = await this.read();
    return data.map(fn);
  }

  filter(fn) {
    const prevPromise = this.read();
    // We need to make a new object so that the filters don't conflict since we're memoizing the data promise
    // e.g. Doing this is supported: `
    //   const foo = org.repos();
    //   foo.filter(repo => repo.name.startsWith('foo')).forEach(log);
    //   foo.filter(repo => repo.name.startsWith('bar')).forEach(log);
    // `
    const newObject = new this.constructor(this._ctorArgs);
    newObject._dataPromise = prevPromise.then(fn);
    return newObject;
  }
}
