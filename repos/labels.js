const ReaderWriter = require('../reader-writer');

module.exports = class Labels extends ReaderWriter {
  constructor(repos) {
    super(...arguments);

    this.repos = repos;
  }

  async readCore() {
    const data = []
    // Read all the parent repos data
    const repos = await this.repos.read();
    // TODO: simplify with async map.
    for(const repo of repos) {
      // Get the data
      // TODO: probably push a tuple here that give you repo-label pairs
      data.push.apply(data, await this.hulk.labels(repo));
    }
    return data;
  }
}