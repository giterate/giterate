const assume = require('assume');
const { createRepos } = require('../helpers');

const branches = [
  'master',
  'branch-one',
  'branch-two'
];

describe('.branches()', function () {
  it('.forEach(fn)', async () => {
    const repos = createRepos({ source: 'giterate/test-fixture' });
    await repos.branches().forEach(({ branch }) => {
      assume(branches).includes(branch.name);
    });
  });
});
