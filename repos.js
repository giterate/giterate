const Reader = require('./reader');

const definitions = {
  files: require('./repos/files'),
  labels: require('./repos/labels'),
  prs: require('./repos/prs'),
  webhooks: require('./repos/webhooks')
};

export default class Repos {
  constructor({ source, client }) {
    // this.hulk = new Githulk(client);
    this._definitions = {};
    this._operations = [];
  }
}

Repos.define = function (method, ReaderWriter) {
  Repos.prototype[method] = function () {
    this._definitions[method] = this._definitions[method]
      || new ReaderWriter(this);

    this._operations.push(() => {
      return await this._definitions[method].read()
    });
  }
};

Object.entries(definitions)
  .forEach([method, ReaderWriter] => {
    Repos.define(method, ReaderWriter);
  })
