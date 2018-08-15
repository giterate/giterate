const ReaderWriter = require('../reader-writer');

module.exports = class Pulls extends ReaderWriter {
  constructor(repos, filterFn = null) {
    super(...arguments);

    this.repos = repos;
    this.filterFn = filterFn;
  }

  // async readCore() -- NYI

  async createPRsForOneBranchName(branchName) {
    return this.createPRs(await this.repos.map(
      repo => ({
        name: branchName,
        repo
      })
    ));
  }

  async createPRs(branches) {
    return Promise.all(
      branches.map(branch => {
        const options = {
          base: 'master', // The name of the branch you want your changes pulled into.
          body: 'Auto-generated PR from giterate',       // The contents of the pull request.
          head: branch.name,       // The name of the branch where your changes are implemented.
          // issue: issueNumber,      // The issue number in this repository to turn into a Pull Request.
          state: 'open',      // Either open, closed.
          title: 'Giterated update'       // The title of the pull request.
        };

        return new Promise((resolve, reject) => {
          this.hulk.pulls.create(branch.repo.full_name,
            options,
            (err, results) => {
              if (err) {
                return void reject(err);
              }
              resolve(results);
            }
          );
        });
      })
    );
  }
}
