const ReaderWriter = require('../reader-writer');

module.exports = class Contents extends ReaderWriter {
  constructor(files, ops = {})  {
    super(...arguments);
    const {filterFn = null} = ops;
    this.files = files;
    this.filterFn = filterFn;
  }

  async readCore() {
    const data = []
    const files = await this.files.read();
    for(const {repo, file} of files) {
      let content = file.content;
      if(!content) {
        const temp = await this.readSingle(repo, file);
        content = temp.content;
      } 
      content = Buffer.from(content || '', 'base64').toString();
      data.push({ repo, file, content });
    }

    return data;
  }

  // TODO: Do this or just promisify all of githulk?
  readSingle(repo, file) {
    return new Promise((resolve, reject) => {
      this.hulk.repository.contents(repo.full_name,  { path: file.path }, (err, results) => {
        if (err) {
          return void reject(err);
        }
        resolve(results);
      })
    })
  }
}

