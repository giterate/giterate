const ReaderWriter = require('../reader-writer');

module.exports = class Labels extends ReaderWriter {
  constructor(repos, filterFn = null, path = "/") {
    super(...arguments);
    this.repos = repos;
    this.filterFn = filterFn;
    this.path = path;
  }

  async readCore() {
    const data = []
    // Read all the parent repos data
    const repos = await this.repos.read();
    // TODO: simplify with async map.
    for(const repo of repos) {
      // Get the data
      let files = await this.readSingle(repo);
      if (this.filterFn) {
        files = files.filter(this.filterFn);
      }
      if (files && files.length) {
        data.push.apply(data, files.map(file => ({ repo, file })));
      }
    }

    return data;
  }

  // TODO: Do this or just promisify all of githulk?
  readSingle(repo) {
    return new Promise((resolve, reject) => {
      this.hulk.repository.contents(repo.full_name,  { path: this.path }, (err, results) => {
        if (err) {
          return void reject(err);
        }
        resolve(results);
      })
    })
  }
}
