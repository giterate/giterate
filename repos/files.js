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
};

define(Files, definitions);
