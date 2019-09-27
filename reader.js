const GitHulk = require('githulk');

module.exports = class Reader {
  constructor({ hulk, github }) {
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

  /**
   * A synonym for `read`, but can feel nicer for code that may side-effect and you don't care about the response
   * @example await giterate().repos().branch().create('foo').evaluate();
   * @returns {Promise} A promise
   */
  evaluate() {
    return this.read();
  }

  async readCore() {
    throw new Error('Must be implemented by derived class');
  }

  async forEach(fn) {
    const data = await this.read();
    for (const item of data) {
      fn(item);
    }
  }

  async forEachAsync(fn) {
    const data = await this.read();
    for (const item of data) {
      await fn(item);
    }
  }

  async map(fn) {
    const data = await this.read();
    return data.map(fn);
  }

  async mapAsync(fn) {
    const data = await this.read();
    return await Promise.all(data.map(fn));
  }

  filter(fn) {
    // We need to make a new object so that the filters don't conflict since we're memoizing the data promise
    // e.g. Doing this is supported: `
    //   const foo = org.repos();
    //   foo.filter(repo => repo.name.startsWith('foo')).forEach(log);
    //   foo.filter(repo => repo.name.startsWith('bar')).forEach(log);
    // `
    const prevPromise = this.read();
    const newPromise = prevPromise.then(data => data.filter(fn));
    return this._cloneWithData(newPromise);
  }

  filterAsync(fn) {
    // We need to make a new object so that the filters don't conflict since we're memoizing the data promise
    // e.g. Doing this is supported: `
    //   const foo = org.repos();
    //   foo.filter(repo => repo.name.startsWith('foo')).forEach(log);
    //   foo.filter(repo => repo.name.startsWith('bar')).forEach(log);
    // `
    const prevPromise = this.read();
    const newPromise = prevPromise
      .then(data => Promise.all(data.map(async item => ({
        filtered: await fn(item),
        value: item
      }))))
      .then(allData => allData
        .filter(item => item.filtered)
        .map(item => item.value));
    return this._cloneWithData(newPromise);
  }

  _cloneWithData(dataPromise) {
    const newObject = new this.constructor(...this._ctorArgs);
    newObject._dataPromise = dataPromise;
    return newObject;
  }
};
