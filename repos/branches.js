const ReaderWriter = require('../reader-writer');

module.exports = class Branches extends ReaderWriter {
  constructor(repos) {
    super(...arguments);

    this.repos = repos;
  }

  async readCore() {
    const data = [];
    // Read all the parent repos data
    const repos = await this.repos.read();
    // TODO: simplify with async map.
    for (const repo of repos) {
      // Get the data
      const branches = await this.readSingle(repo);
      if (branches && branches.length) {
        data.push.apply(data, branches.map(branch => ({ repo, branch })));
      }
    }

    return data;
  }

  // TODO: Do this or just promisify all of githulk?
  readSingle(repo) {
    return new Promise((resolve, reject) => {
      this.hulk.repository.branches(repo.full_name, null, (err, results) => {
        if (err) {
          return void reject(err);
        }
        resolve(results);
      });
    });
  }
};
