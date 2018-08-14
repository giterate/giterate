const Reader = require('../reader');
const define = require('../define');

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

define(Orgs, definitions);
