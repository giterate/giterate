const Reader = require('./reader');

const definitions = {
  files: require('./repos/files'),
  labels: require('./repos/labels'),
  prs: require('./repos/prs'),
  webhooks: require('./repos/webhooks')
};

export default class Repos extends Reader {
  constructor({ source, org, client, hulk }) {
    this.hulk = hulk || new Githulk(client);
    this._source = source;
    this._org = org;
    this._definitions = {};
  }

  async readCore() {
    if (this._source) {
      // TODO: get all the repos in _source from githulk
    }

    // TODO: get all the repos from the org from githulk
  }
}

Repos.define = function (method, ReaderWriter) {
  Repos.prototype[method] = function () {
    this._definitions[method] = this._definitions[method]
      || new ReaderWriter(this);

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