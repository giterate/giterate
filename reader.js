const GitHulk = require('githulk');

export default class Reader {
  constructor({hulk, github}) {
    if (hulk) {
      this.hulk = hulk;
    } else {
      this.hulk = new GitHulk(github);
    }
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
    // TODO: should this make a new object or overwrite the existing promise.
    // i.e. can I do `const foo = org.repos();  foo.filter(fn1).forEach(log); foo.filter(fn2).forEach(log);`
  }
}
