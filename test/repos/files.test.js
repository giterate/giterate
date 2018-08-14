const assume = require('assume');
const { createRepos } = require('../helpers');

describe.only('.files()', function () {
  let repos;

  beforeEach(() => {
    repos = createRepos();
  })

//  this.timeout(50000);

  let files = [
    '.gitignore',
    'LICENSE',
    'README.md'
  ];

  it('with file path', async () => {
    const repos = createRepos({ source: 'giterate/test-fixture' });
    await repos.files(null, './README.md').forEach(({file}) => {
      assume(file.name).equals('README.md');
    });
  });

  it('.forEach(fn)', async () => {
    const repos = createRepos({ source: 'giterate/test-fixture' });
    await repos.files().forEach(({ file}) => {
      assume(files).includes(file.name);
    });
  });
});
