const assume = require('assume');
const { createRepos } = require('../helpers');

describe('.labels()', function () {
  it('.forEach(fn)', async () => {
    const repos = createRepos({ source: 'giterate/test-fixture' });
    await repos.labels().forEach(label => {
      assume(labels).includes(label);
    });
  });
});
