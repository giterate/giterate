const Reader = require('../reader');

const definitions = {
  teams: require('./teams'),
  repos: require('../repos')
};

const Orgs = module.exports = class Orgs extends Reader {
  constructor({ orgs }) {
    super(...arguments);

    this._orgs = typeof orgs === 'string' ? [orgs] : orgs;
    this._definitions = {};
  }

  async readCore() {
    const results = [];
    for(const orgName of this._orgs) {
      const org = await this.getOne(orgName);
      results.push(org);
    }
    return results;
  }

  getOne(orgName) {
    return new Promise((resolve, reject) => {
      this.hulk.organizations.get(orgName, null, (err, results) => {
        if (err) {
          return void reject(err);
        }
        resolve(results[0]);
      });
    })
  }
}

Orgs.define = function (method, ReaderWriter) {
  Orgs.prototype[method] = function () {
    this._definitions[method] = this._definitions[method]
      || new ReaderWriter(this, ...arguments);

    return this._definitions[method];
  }
};

Object.entries(definitions)
  .forEach(([method, ReaderWriter]) => {
    Orgs.define(method, ReaderWriter);
  });
