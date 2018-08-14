const GitHulk = require('githulk');

export default class Reader {
  constructor(options) {}

  async read(query) {
    throw new Error('Must be implemented by derived class');
  }

  forEach(fn) {

  }

  map(fn) {

  }
}
