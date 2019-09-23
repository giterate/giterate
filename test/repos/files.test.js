const assume = require('assume');
const { createRepos } = require('../helpers');

describe('.files()', function () {
  this.timeout(50000);

  const files = [
    '.gitignore',
    'LICENSE',
    'README.md',
    'tests'
  ];

  const testContent = {
    'test1.md': 'short string of text for tests',
    'test2.md': 'another string o\' text'
  };

  it('with file path', async () => {
    const repos = createRepos({ source: 'giterate/test-fixture' });
    await repos.files({ path: './README.md' }).forEach(({ file }) => {
      assume(file.name).equals('README.md');
    });
  });

  it('with file contents', async () => {
    const repos = createRepos({ source: 'giterate/test-fixture' });
    await repos.files({ path: './tests/test1.md' }).contents().forEach(({ file, content }) => {
      assume(file.name).equals('test1.md');
      assume(content).equals('short string of text for tests');
    });
  });

  it('multiple file contents', async () => {
    const repos = createRepos({ source: 'giterate/test-fixture' });
    const allFiles = await repos.files({ path: './tests' }).contents().read();
    assume(allFiles.length).equals(2);
    allFiles.forEach(({ file, content }) => {
      const fileName = file.name;
      assume(testContent[fileName]).exists();
      assume(testContent[fileName]).equals(content);
    });
  });

  it('.forEach(fn)', async () => {
    const repos = createRepos({ source: 'giterate/test-fixture' });
    await repos.files().forEach(({ file }) => {
      assume(files).includes(file.name);
    });
  });
});
