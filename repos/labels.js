const ReaderWriter = require('../reader-writer');

module.exports = class Labels extends ReaderWriter {
  constructor(repos, filterFn = null) {
    super(...arguments);

    this.repos = repos;
    this.filterFn = filterFn;
  }

  async readCore() {
    const data = []
    // Read all the parent repos data
    const repos = await this.repos.read();
    // TODO: simplify with async map.
    for(const repo of repos) {
      // Get the data
      let labels = await this.readSingle(repo);
      if (this.filterFn) {
        labels = labels.filter(this.filterFn);
      }
      if (labels && labels.length) {
        data.push.apply(data, labels.map(label => ({ repo, label })));
      }
    }

    return data;
  }

  // TODO: Do this or just promisify all of githulk?
  readSingle(repo) {
    return new Promise((resolve, reject) => {
      this.hulk.labels.list(repo.full_name, null, (err, results) => {
        if (err) {
          return void reject(err);
        }
        resolve(results);
      })
    })
  }
}
