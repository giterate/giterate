const ReaderWriter = require('../reader-writer');

module.exports = class Pulls extends ReaderWriter {
  constructor(repos, filterFn) {
    super(...arguments);

    this.repos = repos;
    this.filterFn = filterFn;
  }

  // async readCore() -- NYI
  async readCore() {
    const data = [];
    // Read all the parent repos data
    const repos = await this.repos.read();
    // TODO: simplify with async map.
    for (const { repo } of repos) {
      // Get the data
      const prs = await this.readSingle(repo);
      if (prs && prs.length) {
        data.push(...prs.map(pr => ({ repo, pr })));
      }
    }

    return data;
  }

  // TODO: Do this or just promisify all of githulk?
  readSingle(repo) {
    return new Promise((resolve, reject) => {
      this.hulk.pulls.list(repo.full_name, null, (err, results) => {
        if (err) {
          return void reject(err);
        }
        resolve(results);
      });
    });
  }

  create(opts = {}) {
    return this._cloneWithData(this.createCore(opts));
  }

  async createCore(opts = {}) {
    const repos = await this.repos.read();
    return Promise.all(repos.map(({ repo, branch }) =>
      this.createOne(repo, branch, opts)
    ));
  }

  createOne(repo, branch, opts) {
    const options = {
      base: 'master', // The name of the branch you want your changes pulled into.
      body: 'Auto-generated PR from giterate', // The contents of the pull request.
      // issue: issueNumber, // The issue number in this repository to turn into a Pull Request.
      state: 'open', // Either open, closed.
      title: 'Giterated update', // The title of the pull request.
      ...opts,
      head: branch.name // The name of the branch where your changes are implemented.
    };

    return new Promise((resolve, reject) => {
      this.hulk.pulls.create(repo.full_name,
        options,
        (err, results) => {
          if (err) {
            return void reject(err);
          }
          // Deference the array if possible, otherwise return the raw results
          resolve({
            repo,
            branch,
            // GitHulk returns an array for each create,
            // so we need to pull out the item that was created
            pr: results && results[0] || results
          });
        }
      );
    });
  }

  async close() {
    const prsToClose = await this.read();
    return Promise.all(prsToClose.map(({ repo, branch, pr }) =>
      this.closeOne(repo, branch, pr.number)
    ));
  }

  closeOne(repo, branch, number) {
    return new Promise((resolve, reject) => {
      this.hulk.pulls.edit(repo.full_name,
        number,
        { state: 'closed' },
        (err, results) => {
          if (err) {
            return void reject(err);
          }
          // Deference the array if possible, otherwise return the raw results
          resolve({
            repo,
            branch,
            // GitHulk returns an array for each create,
            // so we need to pull out the item that was created
            pr: results && results[0] || results
          });
        }
      );
    });
  }

};
