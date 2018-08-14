const GitHulk = require('githulk');

export default class Reader {
  constructor(options) {
    this.githulk = options.githulk || new GitHulk(options.github);
  }

  async read(query) {
    this.githulk.send(query);
  }
}