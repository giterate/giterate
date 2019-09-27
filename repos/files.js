const ReaderWriter = require('../reader-writer');
const define = require('../define');

const definitions = {
  contents: require('./contents')
};

const Files = module.exports = class Files extends ReaderWriter {
  constructor(repos, ops = {})  {
    super(...arguments);
    const { filterFn = null, path = '/' } = ops;
    this.repos = repos;
    this.filterFn = filterFn;
    this.path = path;
  }

  async readCore() {
    const data = [];
    // Read all the parent repos data
    const repos = await this.repos.read();
    // TODO: simplify with async map.
    for (const { repo, branch } of repos) {
      // Get the data
      let files = await this.readSingle(repo, branch);
      if (this.filterFn) {
        files = files.filter(this.filterFn);
      }
      if (files && files.length) {
        data.push.apply(data, files.map(file => ({ repo, branch, file })));
      }
    }

    return data;
  }

  // TODO: Do this or just promisify all of githulk?
  readSingle(repo, branch) {
    return new Promise((resolve, reject) => {
      const options = { path: this.path };
      if (branch && branch.name) {
        options.ref = branch.name;
      }

      this.hulk.repository.contents(repo.full_name, options, (err, results) => {
        if (err) {
          return void reject(err);
        }
        resolve(results);
      });
    });
  }

  create(contents, message = 'Created by giterate') {
    const contentUpdater = typeof contents === 'string' ?
      () => contents :
      contents;

    // Creating a file is effectively the same as updating one
    return this._cloneWithData(this.createCore(contentUpdater, message));
  }

  async createCore(contentsFn, message) {
    const repos = await this.repos.read();
    return Promise.all(
      repos.map(({ repo, branch }) => ({
        repo,
        branch,
        file: { path: this.path }
      })).map(current => this.createOrUpdateSingle(
        current, contentsFn(current), message))
    );
  }

  async createOrUpdateSingle({ repo, branch, file }, newContent, message) {
    return new Promise((resolve, reject) => {
      const data = {
        message,
        content: Buffer.from(newContent).toString('base64')
      };

      if (branch && branch.name) {
        data.branch = branch.name;
      }

      if (file && file.sha) {
        data.sha = file.sha;
      }

      // TODO: Move to githulk
      this.hulk.send(
        // PUT /repos/:owner/:repo/contents/:path
        ['repos', repo.owner.login, repo.name, 'contents', file.path],
        {
          method: 'PUT',
          params: ['branch', 'sha', 'message', 'content'],
          ...data
        },
        (err, result) => {
          if (err) {
            return void reject(err);
          }

          // We need to merge the existing file with that of the response (e.g. to get updated shas).
          resolve({
            repo,
            branch,
            file: {
              ...file,
              ...(result && result[0] && result[0].content)
            },
            content: newContent
          });
        }
      );
    });
  }


  delete(message = 'Deleted by giterate') {
    return this._cloneWithData(this.deleteCore(message));
  }

  async deleteCore(message) {
    const data = await this.read();
    await Promise.all(
      data.map(current => this.deleteSingle(current, message))
    );
    return [];
  }

  async deleteSingle({ repo, branch, file }, message) {
    return new Promise((resolve, reject) => {
      const data = {
        message,
        sha: file.sha
      };

      if (branch && branch.name) {
        data.branch = branch.name;
      }

      // TODO: Move to githulk
      this.hulk.send(
        // PUT /repos/:owner/:repo/contents/:path
        ['repos', repo.owner.login, repo.name, 'contents', file.path],
        {
          method: 'DELETE',
          params: ['branch', 'sha', 'message'],
          ...data
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

define(Files, definitions);
