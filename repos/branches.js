const ReaderWriter = require('../reader-writer');
const define = require('../define');
const definitions = require('./definitions');

const Branches = module.exports = class Branches extends ReaderWriter {
  constructor(repos) {
    super(...arguments);

    this.repos = repos;
  }

  async readCore() {
    const data = [];
    // Read all the parent repos data
    const repos = await this.repos.read();
    // TODO: simplify with async map.
    for (const { repo } of repos) {
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

  create(name) {
    return this._cloneWithData(this.createCore(name));
  }

  async createCore(name) {
    const repos = await this.repos.read();
    const reposNeedingCreates = [];
    const completedBranches = await this.filter((tuple) => tuple.branch.name === name).read();
    for (const { repo, branch } of repos) {
      if (!completedBranches.find(({ branchRepo }) => branchRepo.full_name === repo.full_name)) {
        reposNeedingCreates.push({ repo, branch });
      }
    }

    for (const { repo, branch: parentBranch } of reposNeedingCreates) {
      const branch = await this.createOne(repo, parentBranch, name);
      completedBranches.push({ repo, branch });
    }

    return completedBranches;
  }

  createOne(repo, parentBranch, name) {
    return new Promise((resolve, reject) => {
      this.getCommitSha(repo, parentBranch, (commitError, sha) => {
        if (commitError) {
          return void reject(commitError);
        }

        // TODO: Move to githulk
        this.hulk.send(
          // /repos/:user/:repo/git/refs
          ['repos', repo.owner.login, repo.name, 'git', 'refs'],
          {
            method: 'POST',
            params: ['ref', 'sha'],
            ref: `refs/heads/${name}`,
            sha: sha
          },
          (err) => {
            if (err) {
              return void reject(err);
            }

            // Now we have a ref, but we need to get the branch data.
            this.hulk.repository.branch(repo.full_name, { branch: name }, (branchError, branch) => {
              if (branchError) {
                return void reject(branchError);
              }

              resolve(branch);
            });
          }
        );

      });
    });
  }

  getCommitSha(repo, parentBranch, callback) {
    const branchSha = parentBranch && parentBranch.commit && parentBranch.commit.sha;
    if (branchSha) {
      return void callback(null, branchSha);
    }

    this.hulk.repository.commitSha(repo.full_name, { page: 1, per_page: 1, nofollow: true }, callback);
  }

  async delete() {
    const branchesToDelete = await this.read();

    for (const { repo, branch } of branchesToDelete) {
      await this.deleteOne(repo, branch.name);
    }
  }

  deleteOne(repo, name) {
    return new Promise((resolve, reject) => {
      // TODO: move to githulk
      this.hulk.send(
        // /repos/:owner/:repo/git/refs/:ref
        // /repos/giterate/test-fixture-mutable/git/refs/heads/unit-test-a415e6b8-d844-43ac-83ba-78a941b25891
        ['repos', repo.owner.login, repo.name, 'git', 'refs', 'heads', name],
        {
          method: 'DELETE'
        },
        (err) => {
          if (err) {
            return void reject(err);
          }

          resolve();
        }
      );
    });
  }
};

define(Branches, Object.assign({}, definitions, { branches: Branches }));
