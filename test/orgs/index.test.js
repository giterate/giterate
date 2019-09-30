const assume = require('assume');
const { createOrgs, wait } = require('../helpers');

describe('.repos()', function () {
  this.timeout(50000);

  function getRepoName({ repo }) {
    return repo.name;
  }

  async function getRepoNameAsync({ repo }) {
    return await wait(1, repo.name);
  }

  it('.map(fn)', async function () {
    const orgs = createOrgs({ orgs: 'giterate' });
    const repoNames = await orgs.repos().map(getRepoName);
    assume(repoNames).contains('giterate');
    assume(repoNames).contains('test-fixture');
  });

  it('.mapAsync(async fn)', async function () {
    const orgs = createOrgs({ orgs: 'giterate' });
    const repoNames = await orgs.repos().mapAsync(getRepoNameAsync);
    assume(repoNames).contains('giterate');
    assume(repoNames).contains('test-fixture');
  });

  it('.filter(fn)', async function () {
    const orgs = createOrgs({ orgs: 'giterate' });
    const repoNames = await orgs.repos()
      .filter(({ repo }) => repo.name === 'giterate')
      .map(getRepoName);
    assume(repoNames).to.have.length(1);
    assume(repoNames).contains('giterate');
  });

  it('.filterAsync(async fn)', async function () {
    const orgs = createOrgs({ orgs: 'giterate' });
    const repoNames = await orgs.repos()
      .filterAsync(async ({ repo }) => await wait(1, repo.name === 'giterate'))
      .map(getRepoName);
    assume(repoNames).to.have.length(1);
    assume(repoNames).contains('giterate');
  });
});
