const assume = require('assume');
const { createOrgs } = require('../helpers');

describe('.repos()', function () {
  this.timeout(50000);

  it('.map(fn)', async function () {
    const orgs = createOrgs({ orgs: 'giterate' });
    const repoNames = await orgs.repos().map(({ repo }) => repo.name);
    assume(repoNames).contains('giterate');
    assume(repoNames).contains('test-fixture');
  });
});
