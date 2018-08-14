const Reader = require('./reader');

const definitions = {
  files: require('./repos/files'),
  labels: require('./repos/labels'),
  prs: require('./repos/prs'),
  webhooks: require('./repos/webhooks')
};

module.exports = class Repos extends Reader {
  constructor(options) {
    super(...arguments);

    if (options && options.read) {
      this._org = options;
      return;
    }

    const { source } = options;
    this._source = typeof source === 'string' ? [source] : source;
    this._org = org;
    this._definitions = {};
  }

  async readCore() {
    const results = [];
    if (this._source) {
      for(const source of this._source) {
        const repo = await this.getOne(source);
        results.push(repo);
      }
      return results;
    }

    const orgs = await this._org.read();
    for(const org of orgs) {
      const reposInOrg = await this.getFromOrg(org);
      results.push.apply(results, reposInOrg);
    }
    return results;
  }

  getOne(source) {
    return new Promise((resolve, reject) => {
      this.hulk.repository.get(source, null, (err, results) => {
        if (err) {
          return void reject(err);
        }
        resolve(results);
      });
    })
  }

  getFromOrg(org) {
    return new Promise((resolve, reject) => {
      this.hulk.repository.list(org.name, null, (err, results) => {
        if (err) {
          return void reject(err);
        }
        resolve(results);
      })
    });
  }
}

Repos.define = function (method, ReaderWriter) {
  Repos.prototype[method] = function () {
    this._definitions[method] = this._definitions[method]
      || new ReaderWriter(this, ...arguments);

    // this._operations.push(() => {
    //   return await this._definitions[method].read()
    // });
    return this._definitions[method];
  }
};

Object.entries(definitions)
  .forEach(([method, ReaderWriter]) => {
    Repos.define(method, ReaderWriter);
  });


  //myRepos.labels().forEach(a => console.log(a))