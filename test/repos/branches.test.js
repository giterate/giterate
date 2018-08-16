const assume = require('assume');
const { createRepos } = require('../helpers');
const uuidv4 = require('uuid/v4');


const branches = [
  'master',
  'branch-one',
  'branch-two'
];

describe('.branches()', function () {
  this.timeout(5e4);

  it('.forEach(fn)', async () => {
    const repos = createRepos({ source: 'giterate/test-fixture' });
    await repos.branches().forEach(({ branch }) => {
      assume(branches).includes(branch.name);
    });
  });

  it('.create(name)', async () => {
    const repos = createRepos({ source: 'giterate/test-fixture-mutable' });
    const branchName = `unit-test-${uuidv4()}`;
    const branches = await repos.branches().create(branchName);
    const branchNames = await branches.map(({ branch }) => branch.name);
    assume(branchNames).to.have.length(1);
    assume(branchNames).contains(branchName);

    await branches.delete();
  });
});
