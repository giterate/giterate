const ReaderWriter = require('../reader-writer');

module.exports = class Contents extends ReaderWriter {
  constructor(files, ops = {})  {
    super(...arguments);
    const { filterFn = null } = ops;
    this.files = files;
    this.filterFn = filterFn;
  }

  async readCore() {
    const data = [];
    const files = await this.files.read();
    for (const { repo, branch, file } of files) {
      let content = file.content;
      if (!content) {
        const temp = await this.readSingle(repo, branch, file);
        content = temp.content;
      }
      content = Buffer.from(content || '', 'base64').toString();
      data.push({ repo, branch, file, content });
    }

    return data;
  }

  // TODO: Do this or just promisify all of githulk?
  readSingle(repo, branch, file) {
    return new Promise((resolve, reject) => {
      const options = { path: file.path };
      if (branch && branch.name) {
        options.ref = branch.name;
      }

      this.hulk.repository.contents(repo.full_name,  options, (err, results) => {
        if (err) {
          return void reject(err);
        }
        resolve(results);
      });
    });
  }

  update(contents, message = 'Updated by giterate') {
    const contentUpdater = typeof contents === 'string' ?
      () => contents :
      contents;

    return this._cloneWithData(this.updateCore(contentUpdater, message));
  }

  async updateCore(contentsFn, message) {
    const data = await this.read();
    return Promise.all(
      data.map(current => this.files.createOrUpdateSingle(current, contentsFn, message))
    );
  }
};

