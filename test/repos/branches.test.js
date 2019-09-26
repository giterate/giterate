const assume = require('assume');
const { createRepos } = require('../helpers');
const uuidv4 = require('uuid/v4');


const branches = [
  'master',
  'branch-one',
  'branch-two',
  'pull-request-branch'
];

describe('.branches()', function () {
  this.timeout(5e4);

  it('.forEach(fn)', async () => {
    const repos = createRepos({ source: 'giterate/test-fixture' });
    await repos.branches().forEach(({ branch }) => {
      assume(branches).includes(branch.name);
    });
  });

  describe('.create()', function () {
    it('creates a branch from a repo', async () => {
      const repos = createRepos({ source: 'giterate/test-fixture-mutable' });
      const branchName = `unit-test-${uuidv4()}`;
      const repoBranches = repos.branches().create(branchName);
      const branchNames = await repoBranches.map(({ branch }) => branch.name);
      assume(branchNames).to.have.length(1);
      assume(branchNames).contains(branchName);

      await repoBranches.delete();
    });

    it('creates a branch from a branch', async () => {
      const repos = createRepos({ source: 'giterate/test-fixture-mutable' });
      const parentBranches = repos.branches().filter(({ branch }) => branch.name === 'test-branch-name');
      const parentBranchNames = await parentBranches.map(({ branch }) => branch.name);
      assume(parentBranchNames).to.have.length(1);
      const parentBranchSha = (await parentBranches.read())[0].branch.commit.sha;

      const childBranchName = `unit-test-child-${uuidv4()}`;
      const childBranches = await parentBranches.branches().create(childBranchName);
      const childBranchData = await childBranches.read();
      assume(childBranchData).to.have.length(1);
      assume(childBranchData[0].branch.commit.sha).to.equal(parentBranchSha);

      await childBranches.delete();
    });
  });
});
