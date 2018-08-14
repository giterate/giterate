const assume = require('assume');
const { createOrgs } = require('../helpers');

describe('.repos()', function () {
  it('.map(fn)', async () => {
    const orgs = createOrgs({ orgs: 'giterate' });
    const repoNames = await orgs.repos().map(repo => repo.name);
    assume(repoNames).contains('giterate');
    assume(repoNames).contains('test-fixture');
  });
});
