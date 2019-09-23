const Reader = require('../reader');
const define = require('../define');
const definitions = require('./definitions');

const Repos = module.exports = class Repos extends Reader {
  constructor(options) {
    super(...arguments);

    if (options && options.read) {
      this._org = options;
      return;
    }

    const { source } = options;
    this._source = typeof source === 'string' ? [source] : source;
  }

  async readCore() {
    const results = [];
    if (this._source) {
      for (const source of this._source) {
        const repo = await this.getOne(source);
        results.push({ repo });
      }
      return results;
    }

    const orgs = await this._org.read();
    for (const org of orgs) {
      const reposInOrg = await this.getFromOrg(org);
      results.push.apply(results, reposInOrg.map(repo => ({ repo })));
    }
    return results;
  }

  getOne(source) {
    return new Promise((resolve, reject) => {
      this.hulk.repository.get(source, null, (err, results) => {
        if (err) {
          return void reject(err);
        }
        resolve(results[0]);
      });
    });
  }

  getFromOrg(org) {
    return new Promise((resolve, reject) => {
      this.hulk.repository.list(org.login, { organization: true }, (err, results) => {
        if (err) {
          return void reject(err);
        }
        resolve(results);
      });
    });
  }
};

define(Repos, Object.assign({}, definitions, { branches: require('./branches') }));
