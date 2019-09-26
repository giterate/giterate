const assume = require('assume');
const uuid = require('uuid/v4');
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

  it('with file path', async function () {
    const repos = createRepos({ source: 'giterate/test-fixture' });
    await repos.files({ path: './README.md' }).forEach(({ file }) => {
      assume(file.name).equals('README.md');
    });
  });

  it('with file contents', async function () {
    const repos = createRepos({ source: 'giterate/test-fixture' });
    await repos.files({ path: './tests/test1.md' }).contents().forEach(({ file, content }) => {
      assume(file.name).equals('test1.md');
      assume(content).equals('short string of text for tests');
    });
  });

  it('multiple file contents', async function () {
    const repos = createRepos({ source: 'giterate/test-fixture' });
    const allFiles = await repos.files({ path: './tests' }).contents().read();
    assume(allFiles.length).equals(2);
    allFiles.forEach(({ file, content }) => {
      const fileName = file.name;
      assume(testContent[fileName]).exists();
      assume(testContent[fileName]).equals(content);
    });
  });

  it('.forEach(fn)', async function () {
    const repos = createRepos({ source: 'giterate/test-fixture' });
    await repos.files().forEach(({ file }) => {
      assume(files).includes(file.name);
    });
  });

  it('updates files', async function () {
    const shaFromFile = ({ file }) => file.sha;
    const path = './README.md';
    const repos = createRepos({ source: 'giterate/test-fixture-mutable' });
    const filesObjects = repos.files({ path });
    const existingShas = await filesObjects.map(shaFromFile);

    // Make sure we have shas to start with
    assume(existingShas).to.have.length(1);
    assume(existingShas[0]).to.be.truthy();

    // Update the file contents and get the new shas
    const updatedShas = await filesObjects.contents().update(
      `# test-fixture-mutable
    A test repository whose properties can be modified (tests don't depend on it)
    <!-- Last updated on ${ new Date() }-->`)
      .map(shaFromFile);

    // Make sure the shas changed
    assume(updatedShas).to.have.length(existingShas.length);
    updatedShas.forEach((newSha, i) => {
      assume(newSha).to.not.equal(existingShas[i]);
    });

    // Make sure we backfilled with the right new shas
    const refreshedFiles = createRepos({ source: 'giterate/test-fixture-mutable' }).files({ path });
    const refreshedShas = await refreshedFiles.map(shaFromFile);
    assume(refreshedShas).to.have.length(updatedShas.length);
    refreshedShas.forEach((newSha, i) => {
      assume(newSha).to.equal(updatedShas[i]);
    });
  });

  it('updates files with function', async function () {
    const path = './README.md';
    const repos = createRepos({ source: 'giterate/test-fixture-mutable' });
    const filesObjects = repos.files({ path });
    const injectedContent =  `<!-- Last updated on ${ new Date() }-->`;

    // Update the file contents and get the new shas
    await filesObjects.contents().update(
      ({ content }) => content.replace(
        /<!--.*-->/g,
        injectedContent)
    )
      .evaluate();

    // Make sure content changed
    const refreshedContent = await createRepos({ source: 'giterate/test-fixture-mutable' })
      .files({ path })
      .contents()
      .map(({ content }) => content);
    assume(refreshedContent).to.have.length(1);
    refreshedContent.forEach((newContent) => {
      assume(newContent).to.contain(injectedContent);
    });
  });

  it('creates files', async function () {
    const path = `./${ uuid() }.md`;
    const fileContents = `# Test file @ ${ new Date() }`;
    const repos = createRepos({ source: 'giterate/test-fixture-mutable' });

    // Make sure the file we're about to create doesn't already exist
    await assume(repos.files({ path }).read()).to.throwAsync();

    // Create the file
    await repos.files({ path }).create(fileContents).evaluate();

    // Get the file and validate
    const refreshedFiles = createRepos({ source: 'giterate/test-fixture-mutable' })
      .files({ path });
    const refreshedContent = await refreshedFiles
      .contents()
      .map(({ content }) => content);

    assume(refreshedContent).to.have.length(1);
    refreshedContent.forEach((newContent) => {
      assume(newContent).to.contain(fileContents);
    });

    // delete it
    await refreshedFiles.delete().evaluate();

    // Make sure it deleted
    await assume(repos.files({ path }).read()).to.throwAsync();
  });
});
